/**
 * Default: sample in-memory data (no Laravel required).
 * Set EXPO_PUBLIC_USE_MOCK_DATA=false when the API is ready.
 */
export function isMockBackend() {
  return process.env.EXPO_PUBLIC_USE_MOCK_DATA !== 'false';
}
