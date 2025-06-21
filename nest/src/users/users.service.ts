import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'argon2';
import { User, UserWithPassword, UserWithRolesAndActions } from '../common/types/user.type';
import { RolesService } from '../roles/roles.service';

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

	async findOne(id: number) {
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

		if (!user) throw new NotFoundException();

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

	async getMe(user: UserWithRolesAndActions) {
		return user;
	}

	async findOneByEmail(email: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: {
				email,
				isActive: true,
			},
			omit: {
				password: true,
			},
		});

		if (!user) throw new NotFoundException();

		return user;
	}

	async findOneByEmailWithPassword(
		email: string,
		throwIfEmpty: boolean = true,
	): Promise<UserWithRolesAndActions & UserWithPassword> {
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

		if (!user && throwIfEmpty) throw new NotFoundException('messages.resourceNotFound');

		return user!;
	}

	async createDefaultUser({
		email,
		password,
		firstName,
		lastName,
	}: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
	}): Promise<UserWithRolesAndActions> {
		const userRole = await this.rolesService.findOneByName('User');
		const hashedPassword = await hash(password);

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

	async updatePassword(password, userId: number) {
		await this.prisma.user.update({
			where: { id: userId },
			data: { password },
		});
	}
}
