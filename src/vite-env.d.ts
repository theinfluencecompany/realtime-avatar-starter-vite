/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REALTIME_AVATAR_PROXY_URL?: string;
  readonly VITE_REALTIME_AVATAR_ID?: string;
  readonly VITE_REALTIME_AVATAR_NAME?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
