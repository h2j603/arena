import type { ArenaChannel, ArenaBlock } from './types';

const BASE_URL = 'https://api.are.na/v2';

const DEFAULT_TOKEN = 'sQnJaooxwf8jE8N37NkhMfBH_V00hl_U-tBZBtPAPSU';
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
}

interface UserResponse {
  id: number;
  slug: string;
  username: string;
  avatar_image: { display: string };
}

async function apiFetch<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function getUser(): Promise<UserResponse> {
  return apiFetch('/me');
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
