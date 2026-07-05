import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function signAdminToken(): string {
  return jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '1h' });
  }

  export function verifyAdminToken(token: string): boolean {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
            return (decoded as any).admin === true;
              } catch {
                  return false;
                    }
                    }