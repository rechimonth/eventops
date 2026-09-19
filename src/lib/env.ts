// FASE 8: flags de entorno. Mock mode desacopla la UI del backend.
export const isMockMode = () =>
  (process.env.EXPO_PUBLIC_USE_MOCKS ?? 'false').toLowerCase() === 'true';

export const hasAIBackend = () =>
  Boolean(process.env.EXPO_PUBLIC_AI_API) || Boolean(process.env.GROQ_API_KEY);

export const hasSupabase = () =>
  Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL) && Boolean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
