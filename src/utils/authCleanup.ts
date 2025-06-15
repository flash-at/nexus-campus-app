
export const cleanupAuthState = () => {
  console.log('[AuthCleanup] Starting auth state cleanup...');
  
  // Track what we're removing for debugging
  const removedKeys: string[] = [];
  
  // Clean localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
      removedKeys.push(`localStorage: ${key}`);
    }
  });
  
  // Clean sessionStorage
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
      removedKeys.push(`sessionStorage: ${key}`);
    }
  });
  
  console.log('[AuthCleanup] Removed keys:', removedKeys);
  console.log('[AuthCleanup] Auth state cleanup complete');
  
  return removedKeys.length;
};

export const forceAuthReload = () => {
  console.log('[AuthCleanup] Forcing page reload for clean auth state...');
  window.location.href = '/login';
};
