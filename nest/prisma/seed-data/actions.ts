import { CreateActionDto } from '../../src/actions/dto/create-action.dto';

export const actions: CreateActionDto[] = [
	{ name: 'action:create' },
	{ name: 'action:list' },
	{ name: 'action:read' },
	{ name: 'action:update' },
	{ name: 'action:delete' },

	{ name: 'role:create' },
	{ name: 'role:list' },
	{ name: 'role:read' },
	{ name: 'role:update' },
	{ name: 'role:delete' },

	{ name: 'user:create' },
	{ name: 'user:list' },
	{ name: 'user:read' },
	{ name: 'user:update' },
	{ name: 'user:delete' },
];
