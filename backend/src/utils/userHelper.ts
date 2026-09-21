import bcrypt from 'bcryptjs';
import prisma from './prisma';

export async function ensureUserExists(userId = 'default-user-id') {
  try {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (existing) return existing;

    const passwordHash = await bcrypt.hash('admin123', 10);
    return await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'admin@pjntechnologies.com',
        name: 'PJN Technologies Admin',
        passwordHash,
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
  } catch (err) {
    console.error('ensureUserExists error:', err);
    return null;
  }
}
