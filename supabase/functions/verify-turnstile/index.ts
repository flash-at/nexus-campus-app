
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This is needed for browser-based calls to the function
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // --- TESTING ONLY ---
  // The following code bypasses Cloudflare Turnstile verification and always returns a success response.
  // This should be reverted before moving to production.
  console.log("Bypassing Turnstile verification for testing.");
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
  // --- END TESTING ONLY ---

  /*
  // Original implementation:
  try {
    const { token } = await req.json()
    const secret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET_KEY')

    if (!secret) {
      console.error('Missing CLOUDFLARE_TURNSTILE_SECRET_KEY environment variable')
      throw new Error('Server configuration error.')
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        secret: secret,
        response: token,
      }),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
  */
})
