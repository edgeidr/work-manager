import { Prisma, User as PrismaUser } from '@prisma/client';

export type User = Omit<PrismaUser, 'password'>;

export type UserWithPassword = PrismaUser;

export type UserWithRolesAndActions = Prisma.UserGetPayload<{
	omit: { password: true };
	include: {
		userRoles: true;
		userActions: true;
	};
}>;
