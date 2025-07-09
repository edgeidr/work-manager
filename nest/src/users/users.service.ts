import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash, verify } from 'argon2';
import { User, UserWithPassword } from '../common/types/user.type';
import { RolesService } from '../roles/roles.service';
import { CreateUserInput } from './types/create-user.input';
import { CredentialsInput } from './types/credentials.input';
import { UpdatePasswordInput } from './types/update-password.input';

@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService,
		private rolesService: RolesService,
	) {}

	async create(createUserDto: CreateUserDto) {
		const { password, roleIds, userActions, ...createUserData } = createUserDto;
		const hashedPassword = await hash(createUserDto.password);

		return this.prisma.user.create({
			data: {
				...createUserData,
				password: hashedPassword,
				userRoles: {
					createMany: {
						data:
							roleIds?.map((roleId) => ({
								roleId: roleId,
							})) || [],
					},
				},
				userActions: {
					createMany: {
						data:
							userActions?.map(({ actionId, scope }) => ({
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
			omit: {
				password: true,
			},
		});
	}

	findAll() {
		return this.prisma.user.findMany();
	}

	async findOne(id: number, exception?: HttpException) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				userRoles: true,
				userActions: true,
			},
			omit: {
				password: true,
			},
		});

		if (!user) throw exception ?? new NotFoundException('messages.resourceNotFound');

		return user;
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		await this.findOne(id);

		const { roleIds, userActions, ...updateUserData } = updateUserDto;

		return this.prisma.user.update({
			where: { id },
			data: {
				...updateUserData,
				...(roleIds && {
					userRoles: {
						deleteMany: {},
						createMany: {
							data: roleIds.map((roleId) => ({
								roleId,
							})),
						},
					},
				}),
				...(userActions && {
					userActions: {
						deleteMany: {},
						createMany: {
							data: userActions.map(({ actionId, scope }) => ({
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

	async remove(id: number) {
		await this.findOne(id);

		return this.prisma.user.delete({
			where: { id },
			omit: {
				password: true,
			},
			include: {
				userRoles: true,
				userActions: true,
			},
		});
	}

	async getMe(user: User) {
		return user;
	}

	async findOneByEmail(email: string, exception?: HttpException): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: {
				email,
				isActive: true,
			},
			omit: {
				password: true,
			},
		});

		if (!user) throw exception ?? new NotFoundException('messages.resourceNotFound');

		return user;
	}

	async createDefaultUser(input: CreateUserInput, exception?: HttpException): Promise<User> {
		const { email, password, firstName, lastName } = input;

		await this.validateEmail(email, exception);

		const hashedPassword = await hash(password);
		const userRole = await this.rolesService.findOneByName('User');

		const user = await this.prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				firstName,
				lastName,
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
		const { password, userId } = input;

		await this.findOne(userId, exception);

		await this.prisma.user.update({
			where: { id: userId },
			data: { password },
		});
	}

	async validateEmail(email: string, exception?: HttpException): Promise<void> {
		const existing = await this.prisma.user.findUnique({ where: { email } });

		if (existing) throw exception ?? new NotFoundException('messages.resourceNotFound');
	}

	async validateUserCredentials(input: CredentialsInput, exception?: HttpException): Promise<User> {
		const { email, password } = input;
		const user = await this.prisma.user.findFirst({
			where: {
				email,
				isActive: true,
			},
			include: {
				userRoles: true,
				userActions: true,
			},
		});

		if (!user) throw exception ?? new NotFoundException('messages.resourceNotFound');

		const passwordMatches = await verify(user.password, password);

		if (!passwordMatches) throw exception ?? new NotFoundException('messages.resourceNotFound');

		const { password: userPassword, ...safeUser } = user;

		return safeUser;
	}
}
