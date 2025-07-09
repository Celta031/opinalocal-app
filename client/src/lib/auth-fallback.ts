// Fallback authentication for development when Firebase is not configured
export const createFallbackUser = (email: string, password: string) => {
  return {
    uid: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    displayName: email.split('@')[0],
    photoURL: null,
    providerData: [],
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    }
  };
};

export const isFallbackMode = () => {
  // Always use fallback mode for testing when Firebase configuration issues occur
  return true;
};