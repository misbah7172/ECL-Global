// Session management utilities

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
}

// Get token expiration time
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
}

// Get time until token expires
export function getTimeUntilExpiration(token: string): number | null {
  const expiration = getTokenExpiration(token);
  if (!expiration) return null;
  return expiration - Date.now();
}

// Format time duration
export function formatDuration(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

// Session storage keys
export const SESSION_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  LAST_ACTIVITY: 'lastActivity',
  REFRESH_TOKEN: 'refreshToken',
} as const;

// Update last activity timestamp
export function updateLastActivity(): void {
  localStorage.setItem(SESSION_KEYS.LAST_ACTIVITY, Date.now().toString());
}

// Get last activity timestamp
export function getLastActivity(): number | null {
  const lastActivity = localStorage.getItem(SESSION_KEYS.LAST_ACTIVITY);
  return lastActivity ? parseInt(lastActivity) : null;
}

// Clear all session data
export function clearSession(): void {
  Object.values(SESSION_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Check if session is inactive for too long
export function isSessionInactive(maxInactiveTime: number = 24 * 60 * 60 * 1000): boolean {
  const lastActivity = getLastActivity();
  if (!lastActivity) return false;
  
  return Date.now() - lastActivity > maxInactiveTime;
}
