import { CreateUserDto } from '../../src/users/dto/create-user.dto';

export const superadmin: CreateUserDto = {
	email: 'superadmin@gmail.com',
	password: 'p@ssword',
	firstName: 'Superadmin',
	lastName: 'User',
	isActive: true,
};

export const admin: CreateUserDto = {
	email: 'admin@gmail.com',
	password: 'p@ssword',
	firstName: 'Admin',
	lastName: 'User',
	isActive: true,
};

export const testuser: CreateUserDto = {
	email: 'testuser@gmail.com',
	password: 'p@ssword',
	firstName: 'Test',
	lastName: 'User',
	isActive: true,
};
