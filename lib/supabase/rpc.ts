// Calls a public Supabase function straight from the browser with a plain fetch, so
// visitor events skip the hosting platform's servers and the public pages stay free of
// the full Supabase client. Only functions granted to the anon role work here.
export async function callPublicRpc<T = unknown>(
  name: string,
  args: Record<string, unknown>,
): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    keepalive: true,
  });
  if (!response.ok) throw new Error(`${name} failed with ${response.status}`);
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : null;
}
