import { Prisma } from '@prisma/client';

export type RoleWithActions = Prisma.RoleGetPayload<{
	include: { roleActions: true };
}>;
