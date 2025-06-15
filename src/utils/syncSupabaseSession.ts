
export const syncSupabaseSession = async (firebaseIdToken: string) => {
  const endpoint = "https://rqhgakhmtbimsroydtnj.functions.supabase.co/sync-firebase-auth";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firebaseIdToken }),
  });
  if (!res.ok) {
    throw new Error((await res.json())?.error || "Failed to sync Supabase session");
  }
  const { session } = await res.json();
  return session;
};
