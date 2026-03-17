import { supabase } from './supabase';
import { getSlug } from './api';

const DEBOUNCE_MS = 800;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Pull all user data from Supabase into localStorage. Returns true if data was found. */
export async function pullFromCloud(): Promise<boolean> {
  try {
    const slug = getSlug();
    const { data, error } = await supabase
      .from('user_data')
      .select('tiers, boards, notes, hidden_channels')
      .eq('slug', slug)
      .single();

    if (error || !data) return false;

    if (data.tiers && Object.keys(data.tiers).length > 0)
      localStorage.setItem('arena_block_tiers', JSON.stringify(data.tiers));
    if (data.boards && (data.boards as unknown[]).length > 0)
      localStorage.setItem('arena_boards', JSON.stringify(data.boards));
    if (data.notes && Object.keys(data.notes).length > 0)
      localStorage.setItem('arena_block_notes', JSON.stringify(data.notes));
    if (data.hidden_channels && (data.hidden_channels as unknown[]).length > 0)
      localStorage.setItem('arena_hidden_channels', JSON.stringify(data.hidden_channels));

    return true;
  } catch {
    return false;
  }
}

/** Debounced push of all localStorage data to Supabase. */
export function pushToCloud(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      const slug = getSlug();
      const tiers = JSON.parse(localStorage.getItem('arena_block_tiers') || '{}');
      const boards = JSON.parse(localStorage.getItem('arena_boards') || '[]');
      const notes = JSON.parse(localStorage.getItem('arena_block_notes') || '{}');
      const hidden_channels = JSON.parse(localStorage.getItem('arena_hidden_channels') || '[]');

      await supabase
        .from('user_data')
        .upsert({
          slug,
          tiers,
          boards,
          notes,
          hidden_channels,
          updated_at: new Date().toISOString(),
        });
    } catch {
      // silent fail – data is still in localStorage
    }
  }, DEBOUNCE_MS);
}
