export interface ArenaImage {
  filename: string;
  content_type: string;
  original: { url: string };
  large: { url: string };
  display: { url: string };
  thumb: { url: string };
  square: { url: string };
}

export interface ArenaBlock {
  id: number;
  title: string | null;
  content: string | null;
  content_html: string | null;
  description: string | null;
  source: { url: string; title: string | null } | null;
  image: ArenaImage | null;
  class: 'Image' | 'Text' | 'Link' | 'Media' | 'Attachment' | 'Channel';
  base_class: string;
  created_at: string;
  updated_at: string;
  connected_at: string;
}

export interface ArenaChannel {
  id: number;
  title: string;
  slug: string;
  length: number;
  status: string;
  created_at: string;
  updated_at: string;
  contents: ArenaBlock[] | null;
  metadata: { description: string | null } | null;
}

export type ViewMode = 'grid' | 'list' | 'graph';
