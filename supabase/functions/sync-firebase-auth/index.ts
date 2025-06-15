
// Polyfills and Standard Library
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function errorResponse(message: string, status = 401) {
  return new Response(JSON.stringify({ error: message }), {
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

    // Get Firebase Admin credentials from Supabase secret
    const firebaseSA = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!firebaseSA) return errorResponse("Missing Firebase service account secret.", 500);
    const serviceAccount = JSON.parse(firebaseSA);

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
      decoded = await auth.verifyIdToken(firebaseIdToken);
    } catch (e) {
      return errorResponse("Invalid Firebase ID token", 401);
    }

    // Generate a Supabase session (using service key)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse("Missing Supabase service role key", 500);
    }

    // Do a sign in/up to Supabase with email (use passwordless or a shared fallback password)
    // The preferred way is to call the Admin API for sign in, but since browserless, use the REST API.
    const signInBody = {
      email: decoded.email,
      password: decoded.uid + "___fallback_pw", // Fallback password per user
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
          500
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
          500
        );
      }
    }

    const session = await sessionRes.json();
    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return errorResponse("Unknown error: " + e?.message || e, 500);
  }
});
