import { UserActionInput } from './user-action.input';

export interface UpdateUserInput {
	email?: string;
	firstName?: string;
	lastName?: string;
	isActive?: boolean;
	roleIds?: number[];
	userActions?: UserActionInput[];
}
