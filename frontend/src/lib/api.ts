// src/lib/api.ts
export async function apiGet<T>(_path: string): Promise<T> {
  throw new Error(
    `Legacy REST API call blocked: "${_path}". This page still uses the old /api backend. Switch it to Supabase/GameStore.`
  );
}

export async function apiPost<T>(_path: string, _body?: any): Promise<T> {
  throw new Error(
    `Legacy REST API call blocked: "${_path}". This page still uses the old /api backend. Switch it to Supabase/GameStore.`
  );
}