import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash, verify } from 'argon2';
import { RolesService } from '../roles/roles.service';
import { CreateUserInput } from './types/create-user.input';
import { CredentialsInput } from './types/credentials.input';
import { UpdatePasswordInput } from './types/update-password.input';
import { User } from './types/user.type';
import { UpdateUserInput } from './types/update-user.input';

@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService,
		private rolesService: RolesService,
	) {}

	async create(input: CreateUserInput): Promise<User> {
		const hashedPassword = await hash(input.password);

		return this.prisma.user.create({
			data: {
				email: input.email,
				password: hashedPassword,
				firstName: input.firstName,
				lastName: input.lastName,
				isActive: input.isActive,
				userRoles: {
					createMany: {
						data:
							input.roleIds?.map((roleId) => ({
								roleId: roleId,
							})) || [],
					},
				},
				userActions: {
					createMany: {
						data:
							input.userActions?.map(({ actionId, scope }) => ({
								actionId: actionId,
								scope: scope,
							})) || [],
					},
				},
			},
			include: {
				userRoles: true,
				userActions: true,
			},
			omit: { password: true },
		});
	}

	findAll(): Promise<User[]> {
		return this.prisma.user.findMany({
			omit: { password: true },
		});
	}

	async findOne(id: number, exception?: HttpException): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				userRoles: true,
				userActions: true,
			},
			omit: { password: true },
		});

		if (!user) throw exception ?? new NotFoundException('messages.resourceNotFound');

		return user;
	}

	async update(id: number, input: UpdateUserInput): Promise<User> {
		await this.findOne(id, new BadRequestException('messages.tryAgain'));

		return this.prisma.user.update({
			where: { id },
			data: {
				email: input.email,
				firstName: input.firstName,
				lastName: input.lastName,
				isActive: input.isActive,
				...(input.roleIds && {
					userRoles: {
						deleteMany: {},
						createMany: {
							data: input.roleIds.map((roleId) => ({
								roleId,
							})),
						},
					},
				}),
				...(input.userActions && {
					userActions: {
						deleteMany: {},
						createMany: {
							data: input.userActions.map(({ actionId, scope }) => ({
								actionId,
								scope,
							})),
						},
					},
				}),
			},
			include: {
				userRoles: true,
				userActions: true,
			},
		});
	}

	async remove(id: number): Promise<void> {
		await this.findOne(id);

		await this.prisma.user.delete({
			where: { id },
		});
	}

	async getMe(user: User): Promise<User> {
		return user;
	}

	async findOneByEmail(email: string, exception?: HttpException): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: {
				email,
				isActive: true,
			},
			omit: { password: true },
		});

		if (!user) throw exception ?? new NotFoundException('messages.resourceNotFound');

		return user;
	}

	async createDefaultUser(input: CreateUserInput, exception?: HttpException): Promise<User> {
		await this.validateEmail(input.email, exception);

		const hashedPassword = await hash(input.password);
		const userRole = await this.rolesService.findOneByName('User');

		const user = await this.prisma.user.create({
			data: {
				email: input.email,
				password: hashedPassword,
				firstName: input.firstName,
				lastName: input.lastName,
				isActive: true,
				userRoles: {
					create: {
						roleId: userRole.id,
					},
				},
				userActions: {
					createMany: {
						data: userRole.roleActions.map(({ actionId }) => ({
							actionId,
							scope: 'OWN',
						})),
					},
				},
			},
			omit: { password: true },
			include: {
				userRoles: true,
				userActions: true,
			},
		});

		return user;
	}

	async updatePassword(input: UpdatePasswordInput, exception?: HttpException): Promise<void> {
		await this.findOne(input.userId, exception);

		await this.prisma.user.update({
			where: { id: input.userId },
			data: { password: input.password },
		});
	}

	async validateEmail(email: string, exception?: HttpException): Promise<void> {
		const existing = await this.prisma.user.findUnique({ where: { email } });

		if (existing) throw exception ?? new NotFoundException('messages.resourceNotFound');
	}

	async validateUserCredentials(input: CredentialsInput, exception?: HttpException): Promise<User> {
		const user = await this.prisma.user.findFirst({
			where: {
				email: input.email,
				isActive: true,
			},
			include: {
				userRoles: true,
				userActions: true,
			},
		});

		if (!user) throw exception ?? new NotFoundException('messages.resourceNotFound');

		const passwordMatches = await verify(user.password, input.password);

		if (!passwordMatches) throw exception ?? new NotFoundException('messages.resourceNotFound');

		const { password, ...safeUser } = user;

		return safeUser;
	}
}
