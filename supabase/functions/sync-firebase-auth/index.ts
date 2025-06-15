
// Polyfills and Standard Library
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function errorResponse(message: string, status = 401, extra?: Record<string, unknown>) {
  const body = { error: message, ...extra };
  console.error(`[sync-firebase-auth] Error:`, message, extra || "");
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firebaseIdToken } = await req.json();

    if (!firebaseIdToken) {
      return errorResponse("Missing firebaseIdToken in body", 400);
    }

    // Get Firebase Admin credentials from Supabase secret
    const firebaseSA = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!firebaseSA) return errorResponse("Missing Firebase service account secret.", 500);
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(firebaseSA);
    } catch (err) {
      return errorResponse("Invalid Firebase service account JSON", 500, {err});
    }

    // Dynamically import the Firebase Admin SDK
    const { initializeApp, cert, getApps } = await import("npm:firebase-admin/app");
    const { getAuth } = await import("npm:firebase-admin/auth");

    // Initialize Firebase Admin SDK
    if (getApps().length === 0) {
      initializeApp({ credential: cert(serviceAccount) });
    }

    // Verify the Firebase ID token
    const auth = getAuth();
    let decoded;
    try {
      decoded = await auth.verifyIdToken(firebaseIdToken, true);
    } catch (e) {
      return errorResponse("Invalid Firebase ID token, could not verify or expired", 401, { firebaseIdTokenError: e.message });
    }

    // Generate a Supabase session (using service key)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse("Missing Supabase service role key", 500);
    }

    const signInBody = {
      email: decoded.email,
      password: decoded.uid + "___fallback_pw",
    };

    // Try sign in first
    let sessionRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signInBody),
    });

    if (!sessionRes.ok) {
      // If user not found, create a Supabase user
      const userRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: decoded.email,
          password: signInBody.password,
          email_confirm: true,
        }),
      });

      if (!userRes.ok) {
        const err = await userRes.json();
        return errorResponse(
          "Failed to create Supabase user: " + (err?.msg ?? JSON.stringify(err)),
          500, { userCreateError: err }
        );
      }
      // Try sign in again
      sessionRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signInBody),
      });
      if (!sessionRes.ok) {
        const err = await sessionRes.json();
        return errorResponse(
          "Failed to sign in to Supabase after user creation: " + (err?.msg ?? JSON.stringify(err)),
          500, { signInError: err }
        );
      }
    }

    const session = await sessionRes.json();
    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(`[sync-firebase-auth] Unknown error:`, e);
    return errorResponse("Unknown error: " + (e?.message || e), 500, { raw: String(e) });
  }
});
