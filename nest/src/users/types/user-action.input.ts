import { Scope } from '@prisma/client';

export interface UserActionInput {
	actionId: number;
	scope: Scope;
}
