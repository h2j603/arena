import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zkmhordvpvozsbmjwiij.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_08MN0m3c1c--_nhIxK0lHA_DeIDDL14';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
