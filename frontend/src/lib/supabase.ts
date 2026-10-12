import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://tuhxglfhrgltivhtihcq.supabase.co";

const supabaseKey =
  (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  "sb_publishable_M3bN7OY49EQ0l3ECaJ440g_1g9Udc2Y";

export const supabase = createClient(supabaseUrl, supabaseKey);
