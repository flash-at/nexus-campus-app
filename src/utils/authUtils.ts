
export const cleanupSupabaseSession = () => {
  console.log("Cleaning up Supabase session from localStorage...");
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Target keys used by Supabase for session management
      if (key && (key.startsWith('sb-') || key.startsWith('supabase.auth.token'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed '${key}' from localStorage.`);
    });
  } catch (error) {
    console.error("Error during Supabase session cleanup:", error);
  }
};
