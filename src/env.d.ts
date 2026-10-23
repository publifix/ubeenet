interface ImportMetaEnv {
  readonly PUBLIC_REGISTER_ENDPOINT?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly PUBLIC_SHOW_SETUP_NOTICE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
