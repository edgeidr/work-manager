import { UserActionInput } from '../inputs/user-action.input';

export interface CreateUserInput {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	isActive?: boolean;
	roleIds?: number[];
	userActions?: UserActionInput[];
}
