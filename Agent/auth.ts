// ═══════════════════════════════════════════════════════════════
// DietAndWell — JWT Auth Middleware
// FILE: /backend/src/middleware/auth.ts
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload { id: string; email: string; }

declare global {
  namespace Express {
    interface Request { admin?: JwtPayload; }
  }
}

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
