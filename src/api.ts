import type { ArenaChannel, ArenaBlock } from './types';

const BASE_URL = 'https://api.are.na/v2';

const DEFAULT_TOKEN = 'R7a3rYZUyvGORi1ZQSk3W7y4s0ISiOABodlx8lUiELY';
const DEFAULT_SLUG = 'hyuk-jang-cud6vccao20';

let accessToken = localStorage.getItem('arena_token') || DEFAULT_TOKEN;

export function setToken(token: string) {
  accessToken = token;
  localStorage.setItem('arena_token', token);
}

export function getToken(): string {
  return accessToken;
}

export function clearToken() {
  accessToken = '';
  localStorage.removeItem('arena_token');
  localStorage.removeItem('arena_slug');
}

export function setSlug(slug: string) {
  localStorage.setItem('arena_slug', slug);
}

export function getSlug(): string {
  return localStorage.getItem('arena_slug') || DEFAULT_SLUG;
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  console.log('[arena] fetch', url);
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[arena] error', res.status, body);
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

export async function getUserChannels(slug: string): Promise<ArenaChannel[]> {
  const channels: ArenaChannel[] = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const data = await apiFetch<{ channels: ArenaChannel[] }>(
      `/users/${slug}/channels?page=${page}&per=${perPage}&sort=updated_at&direction=desc`
    );
    channels.push(...data.channels);
    if (data.channels.length < perPage) break;
    page++;
  }
  return channels;
}

export async function getChannelContents(slug: string): Promise<{ channel: ArenaChannel; blocks: ArenaBlock[] }> {
  const blocks: ArenaBlock[] = [];
  let channel: ArenaChannel | null = null;
  let page = 1;
  const perPage = 100;
  while (true) {
    const data = await apiFetch<ArenaChannel>(
      `/channels/${slug}?page=${page}&per=${perPage}`
    );
    if (!channel) channel = data;
    const contents = data.contents || [];
    blocks.push(...contents.filter((b) => b.base_class === 'Block'));
    if (contents.length < perPage) break;
    page++;
  }
  return { channel: channel!, blocks };
}
