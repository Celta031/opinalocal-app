// Fallback authentication for development when Firebase is not configured
export const createFallbackUser = (email: string, password: string) => {
  return {
    uid: "test-uid-123",
    email,
    password,
  };
};

export const isFallbackMode = () => {
  // CORREÇÃO: Altere para 'false' para desativar o modo de teste e usar o Firebase.
  return false; 
};