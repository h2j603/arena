import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import type { ArenaBlock } from '../types';

interface Props {
  blocks: { block: ArenaBlock; channelTitle: string }[];
  categoryAssignments: Record<string, string[]> | null;
  onSelectBlock: (item: { block: ArenaBlock; channelTitle: string }) => void;
}

interface GNode extends SimulationNodeDatum {
  id: string;
  block: ArenaBlock;
  channelTitle: string;
  img?: HTMLImageElement;
  imgLoaded?: boolean;
}

interface GLink extends SimulationLinkDatum<GNode> {
  shared: number;
}

function channelColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 52%)`;
}

function channelColorRGBA(name: string, alpha: number): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsla(${hue}, 55%, 52%, ${alpha})`;
}

export function GraphView({ blocks, categoryAssignments, onSelectBlock }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<ReturnType<typeof forceSimulation<GNode>> | null>(null);
  const nodesRef = useRef<GNode[]>([]);
  const linksRef = useRef<GLink[]>([]);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<{ node: GNode | null; startX: number; startY: number; isDragging: boolean }>({
    node: null, startX: 0, startY: 0, isDragging: false,
  });
  const panRef = useRef<{ active: boolean; lastX: number; lastY: number; moved: boolean }>({
    active: false, lastX: 0, lastY: 0, moved: false,
  });
  const hoveredRef = useRef<GNode | null>(null);
  const rafRef = useRef<number>(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GNode } | null>(null);

  // Unique channels for legend
  const channelLegend = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of blocks.slice(0, 150)) {
      if (!seen.has(item.channelTitle)) {
        seen.set(item.channelTitle, channelColor(item.channelTitle));
      }
      if (seen.size >= 8) break;
    }
    return [...seen.entries()].map(([name, color]) => ({ name, color }));
  }, [blocks]);

  const connectionMode = categoryAssignments ? 'category' : 'channel';

  const toWorld = useCallback((sx: number, sy: number) => {
    const t = transformRef.current;
    return { x: (sx - t.x) / t.k, y: (sy - t.y) / t.k };
  }, []);

  const findNode = useCallback((sx: number, sy: number): GNode | null => {
    const { x, y } = toWorld(sx, sy);
    const r = 22 / transformRef.current.k;
    for (let i = nodesRef.current.length - 1; i >= 0; i--) {
      const n = nodesRef.current[i];
      const dx = (n.x || 0) - x;
      const dy = (n.y || 0) - y;
      if (dx * dx + dy * dy < r * r) return n;
    }
    return null;
  }, [toWorld]);

  // Zoom helpers
  const applyZoom = useCallback((factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const t = transformRef.current;
    const newK = Math.max(0.15, Math.min(5, t.k * factor));
    t.x = cx - (cx - t.x) * (newK / t.k);
    t.y = cy - (cy - t.y) * (newK / t.k);
    t.k = newK;
  }, []);

  const fitToScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !nodesRef.current.length) return;
    const rect = canvas.getBoundingClientRect();
    const nodes = nodesRef.current;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      if (n.x == null) continue;
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y!);
      maxY = Math.max(maxY, n.y!);
    }

    const graphW = maxX - minX + 80;
    const graphH = maxY - minY + 80;
    const scale = Math.min(rect.width / graphW, rect.height / graphH, 2);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    transformRef.current = {
      x: rect.width / 2 - centerX * scale,
      y: rect.height / 2 - centerY * scale,
      k: scale,
    };
  }, []);

  useEffect(() => {
    if (!blocks.length) return;

    const limit = Math.min(blocks.length, 150);
    const subset = blocks.slice(0, limit);

    const nodes: GNode[] = subset.map((item) => {
      const n: GNode = {
        id: String(item.block.id),
        block: item.block,
        channelTitle: item.channelTitle,
      };
      if (item.block.image?.thumb?.url) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { n.imgLoaded = true; };
        img.src = item.block.image.thumb.url;
        n.img = img;
      }
      return n;
    });

    const links: GLink[] = [];
    if (categoryAssignments) {
      for (let i = 0; i < nodes.length; i++) {
        const catsA = categoryAssignments[nodes[i].id] || [];
        if (!catsA.length) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const catsB = categoryAssignments[nodes[j].id] || [];
          const shared = catsA.filter((c) => catsB.includes(c)).length;
          if (shared > 0) {
            links.push({ source: nodes[i], target: nodes[j], shared });
          }
        }
      }
    } else {
      const channelMap = new Map<string, GNode[]>();
      for (const n of nodes) {
        const list = channelMap.get(n.channelTitle) || [];
        list.push(n);
        channelMap.set(n.channelTitle, list);
      }
      channelMap.forEach((group) => {
        for (let i = 0; i < group.length && i < 8; i++) {
          for (let j = i + 1; j < group.length && j < 8; j++) {
            links.push({ source: group[i], target: group[j], shared: 1 });
          }
        }
      });
    }

    nodesRef.current = nodes;
    linksRef.current = links;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    transformRef.current = { x: rect.width / 2, y: rect.height / 2, k: 1 };

    const isMobile = window.innerWidth < 768;
    const sim = forceSimulation<GNode>(nodes)
      .force('link', forceLink<GNode, GLink>(links).id((d) => d.id).distance(isMobile ? 40 : 80).strength((d) => d.shared * 0.3))
      .force('charge', forceManyBody().strength(isMobile ? -50 : -120))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide<GNode>(isMobile ? 16 : 24))
      .alphaDecay(0.02);

    simRef.current = sim;

    return () => {
      sim.stop();
      cancelAnimationFrame(rafRef.current);
    };
  }, [blocks, categoryAssignments]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const t = transformRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(t.k, t.k);

      const hovered = hoveredRef.current;
      const hoveredCats = hovered && categoryAssignments
        ? categoryAssignments[hovered.id] || []
        : [];

      for (const link of linksRef.current) {
        const s = link.source as GNode;
        const e = link.target as GNode;
        if (s.x == null || e.x == null) continue;

        let alpha = 0.08;
        if (hovered) {
          const isConnected = s === hovered || e === hovered;
          alpha = isConnected ? 0.3 : 0.02;
        }

        ctx.beginPath();
        ctx.moveTo(s.x, s.y!);
        ctx.lineTo(e.x, e.y!);
        ctx.strokeStyle = `rgba(150,150,150,${alpha})`;
        ctx.lineWidth = Math.min(link.shared, 3) / t.k;
        ctx.stroke();
      }

      const nodeR = 18;
      for (const node of nodesRef.current) {
        if (node.x == null) continue;
        const x = node.x;
        const y = node.y!;

        let dimmed = false;
        if (hovered && hovered !== node) {
          if (hoveredCats.length > 0) {
            const nodeCats = categoryAssignments?.[node.id] || [];
            const hasShared = hoveredCats.some((c) => nodeCats.includes(c));
            dimmed = !hasShared;
          } else {
            dimmed = true;
          }
        }

        ctx.globalAlpha = dimmed ? 0.12 : 1;

        ctx.beginPath();
        ctx.arc(x, y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = channelColor(node.channelTitle);
        ctx.fill();

        if (node.img && node.imgLoaded) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, nodeR - 1, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(node.img, x - nodeR + 1, y - nodeR + 1, (nodeR - 1) * 2, (nodeR - 1) * 2);
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(x, y, nodeR, 0, Math.PI * 2);
        ctx.strokeStyle = hovered === node
          ? channelColor(node.channelTitle)
          : channelColorRGBA(node.channelTitle, 0.35);
        ctx.lineWidth = hovered === node ? 3 / t.k : 1.5 / t.k;
        ctx.stroke();

        ctx.globalAlpha = 1;
      }

      if (hovered && hovered.x != null && hoveredCats.length > 0) {
        const lx = hovered.x;
        const ly = hovered.y! - nodeR - 8;
        ctx.textAlign = 'center';
        ctx.font = `${11 / t.k}px Inter, sans-serif`;
        const label = hoveredCats.join(' · ');
        const metrics = ctx.measureText(label);
        const pad = 4 / t.k;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath();
        ctx.roundRect(lx - metrics.width / 2 - pad, ly - 7 / t.k - pad, metrics.width + pad * 2, 14 / t.k + pad * 2, 3 / t.k);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText(label, lx, ly);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [categoryAssignments]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const node = findNode(sx, sy);

    if (node) {
      dragRef.current = { node, startX: sx, startY: sy, isDragging: false };
      node.fx = node.x;
      node.fy = node.y;
      simRef.current?.alphaTarget(0.3).restart();
    } else {
      panRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: false };
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [findNode]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (dragRef.current.node) {
      dragRef.current.isDragging = true;
      const pos = toWorld(sx, sy);
      dragRef.current.node.fx = pos.x;
      dragRef.current.node.fy = pos.y;
      return;
    }

    if (panRef.current.active) {
      const dx = e.clientX - panRef.current.lastX;
      const dy = e.clientY - panRef.current.lastY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) panRef.current.moved = true;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      panRef.current.lastX = e.clientX;
      panRef.current.lastY = e.clientY;
      return;
    }

    const node = findNode(sx, sy);
    if (node !== hoveredRef.current) {
      hoveredRef.current = node;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = node ? 'pointer' : 'grab';
      }
      if (node) {
        setTooltip({
          x: e.clientX - (rect?.left || 0),
          y: e.clientY - (rect?.top || 0),
          node,
        });
      } else {
        setTooltip(null);
      }
    }
  }, [findNode, toWorld, categoryAssignments]);

  const handlePointerUp = useCallback(() => {
    if (dragRef.current.node) {
      if (!dragRef.current.isDragging) {
        const node = dragRef.current.node;
        onSelectBlock({ block: node.block, channelTitle: node.channelTitle });
      }
      dragRef.current.node.fx = null;
      dragRef.current.node.fy = null;
      simRef.current?.alphaTarget(0);
      dragRef.current = { node: null, startX: 0, startY: 0, isDragging: false };
    } else if (panRef.current.active && !panRef.current.moved) {
      onSelectBlock(null as unknown as { block: ArenaBlock; channelTitle: string });
    }
    panRef.current = { active: false, lastX: 0, lastY: 0, moved: false };
  }, [onSelectBlock]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const t = transformRef.current;
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const newK = Math.max(0.15, Math.min(5, t.k * factor));
      t.x = sx - (sx - t.x) * (newK / t.k);
      t.y = sy - (sy - t.y) * (newK / t.k);
      t.k = newK;
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  if (!blocks.length) {
    return (
      <div className="graph-empty">
        <p>No references to visualize</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="graph-container">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: 'grab', touchAction: 'none' }}
      />

      {/* Zoom controls */}
      <div className="graph-controls">
        <button className="graph-ctrl-btn" onClick={() => applyZoom(1.3)} title="Zoom in">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="graph-ctrl-btn" onClick={() => applyZoom(1 / 1.3)} title="Zoom out">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="graph-ctrl-btn" onClick={fitToScreen} title="Fit to screen">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5V2h3M9 2h3v3M12 9v3h-3M5 12H2V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="graph-legend">
        <div className="graph-legend-mode">
          <span className="graph-legend-label">Connected by</span>
          <span className="graph-legend-value">
            {connectionMode === 'category' ? 'Shared category' : 'Same channel'}
          </span>
        </div>
        <div className="graph-legend-channels">
          {channelLegend.map(({ name, color }) => (
            <div key={name} className="graph-legend-item">
              <span className="graph-legend-dot" style={{ background: color }} />
              <span className="graph-legend-name">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <div
          className="graph-tooltip"
          style={{ left: tooltip.x, top: tooltip.y - 52 }}
        >
          <span className="graph-tooltip-title">
            {tooltip.node.block.title || tooltip.node.block.source?.title || tooltip.node.channelTitle}
          </span>
          <span className="graph-tooltip-ch">{tooltip.node.channelTitle}</span>
          {categoryAssignments && (
            <span className="graph-tooltip-cats">
              {(categoryAssignments[tooltip.node.id] || []).join(' · ')}
            </span>
          )}
        </div>
      )}
      <style>{graphStyles}</style>
    </div>
  );
}

const graphStyles = `
  .graph-container {
    position: relative;
    flex: 1;
    overflow: hidden;
    background: var(--bg);
  }
  .graph-container canvas {
    display: block;
  }
  .graph-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: var(--text-muted);
    font-size: 13px;
  }

  /* Zoom controls */
  .graph-controls {
    position: absolute;
    bottom: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }
  .graph-ctrl-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--text-secondary);
    transition: all var(--transition-fast);
    border-bottom: 1px solid var(--border-light);
  }
  .graph-ctrl-btn:last-child { border-bottom: none; }
  .graph-ctrl-btn:hover {
    color: var(--text);
    background: var(--accent-soft);
  }

  /* Legend */
  .graph-legend {
    position: absolute;
    bottom: 16px;
    left: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 200px;
    box-shadow: var(--shadow-md);
  }
  .graph-legend-mode {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .graph-legend-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }
  .graph-legend-value {
    font-size: 11px;
    font-weight: 500;
    color: var(--text);
  }
  .graph-legend-channels {
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-top: 1px solid var(--border-light);
    padding-top: 6px;
  }
  .graph-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .graph-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .graph-legend-name {
    font-size: 10px;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Tooltip */
  .graph-tooltip {
    position: absolute;
    pointer-events: none;
    transform: translateX(-50%);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-width: 240px;
    z-index: 10;
    box-shadow: var(--shadow-md);
  }
  .graph-tooltip-title {
    font-size: 11px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .graph-tooltip-ch {
    font-size: 10px;
    color: var(--text-muted);
  }
  .graph-tooltip-cats {
    font-size: 10px;
    font-style: italic;
    color: var(--text-secondary);
    font-family: var(--font-serif);
  }

  @media (max-width: 768px) {
    .graph-legend {
      max-width: 160px;
      padding: 8px 10px;
    }
    .graph-legend-channels { display: none; }
    .graph-controls {
      bottom: 12px;
      right: 12px;
    }
    .graph-ctrl-btn { width: 36px; height: 36px; }
  }
`;
