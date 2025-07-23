// Simple in-memory session storage
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
}

export function getSession(token: string): AdminSession | null {
  const session = sessions.get(token);
  if (!session) return null;
  
  // Check if session is expired
  if (new Date() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  
  return session;
}

export function deleteSession(token: string) {
  sessions.delete(token);
}

export function cleanExpiredSessions() {
  const now = new Date();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}

// Clean expired sessions every hour
setInterval(cleanExpiredSessions, 60 * 60 * 1000);