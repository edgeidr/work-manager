import { User as PrismaUser, UserAction, UserRole } from '@prisma/client';

export type UserWithPassword = PrismaUser & {
	userRoles?: UserRole[];
	userActions?: UserAction[];
};