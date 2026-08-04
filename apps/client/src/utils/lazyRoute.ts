const retryKey = "mission-control:lazy-route-retry";

export async function loadLazyRoute<T>(loader: () => Promise<T>): Promise<T> {
  try {
    const module = await loader();
    sessionStorage.removeItem(retryKey);
    return module;
  } catch (error) {
    const signature = error instanceof Error ? error.message : String(error);
    if (sessionStorage.getItem(retryKey) !== signature) {
      sessionStorage.setItem(retryKey, signature);
      window.location.reload();
      return new Promise<T>(() => undefined);
    }
    throw error;
  }
}
