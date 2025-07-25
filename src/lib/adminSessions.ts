// Simple in-memory session storage with localStorage fallback
// In production, you'd want to use Redis or database storage

interface AdminSession {
  adminId: string;
  username: string;
  status: 'SUPERADMIN' | 'ADMIN';
  expiresAt: Date;
}

const sessions = new Map<string, AdminSession>();

export function createSession(token: string, admin: AdminSession) {
  sessions.set(token, admin);
  // Store session info in a way that can survive server restarts
  if (typeof window !== 'undefined') {
    localStorage.setItem(`admin-session-${token}`, JSON.stringify({
      ...admin,
      expiresAt: admin.expiresAt.toISOString()
    }));
  }
}

export function getSession(token: string): AdminSession | null {
  let session = sessions.get(token);
  
  // If not in memory, try to restore from localStorage
  if (!session && typeof window !== 'undefined') {
    const storedSession = localStorage.getItem(`admin-session-${token}`);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        session = {
          ...parsed,
          expiresAt: new Date(parsed.expiresAt)
        };
        // Restore to memory
        if (session) {
          sessions.set(token, session);
        }
      } catch (error) {
        console.error('Failed to parse stored session:', error);
        localStorage.removeItem(`admin-session-${token}`);
        return null;
      }
    }
  }
  
  if (!session) return null;
  
  // Check if session is expired
  if (new Date() > session.expiresAt) {
    sessions.delete(token);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`admin-session-${token}`);
    }
    return null;
  }
  
  return session;
}

export function deleteSession(token: string) {
  sessions.delete(token);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`admin-session-${token}`);
  }
}

export function cleanExpiredSessions() {
  const now = new Date();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`admin-session-${token}`);
      }
    }
  }
}

// Clean expired sessions every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);