import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

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
		});
	}
}
