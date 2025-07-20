import { User as PrismaUser, UserAction, UserRole } from '@prisma/client';

export type User = Omit<PrismaUser, 'password'> & {
	userRoles?: UserRole[];
	userActions?: UserAction[];
};