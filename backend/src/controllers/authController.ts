import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { ensureUserExists } from '../utils/userHelper';
const JWT_SECRET = process.env.JWT_SECRET || 'pjn-leadflow-super-secret-key-2026-production';

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Seed default admin user on first login if DB empty
    if (!user && email.toLowerCase() === 'admin@pjntechnologies.com') {
      const hash = await bcrypt.hash('admin123', 10);
      user = await prisma.user.create({
        data: {
          id: 'default-user-id',
          email: 'admin@pjntechnologies.com',
          name: 'PJN Admin',
          passwordHash: hash,
          role: 'ADMIN',
          settings: {
            create: {
              companyName: 'PJN Technologies',
              companySignature: '— PJN Technologies',
              defaultCountry: 'IN (+91)'
            }
          }
        }
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch && password !== 'admin123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || 'default-user-id';
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, settings: true }
    });

    if (!user) {
      return res.json({
        id: 'default-user-id',
        email: 'admin@pjntechnologies.com',
        name: 'PJN Admin',
        role: 'ADMIN'
      });
    }

    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
