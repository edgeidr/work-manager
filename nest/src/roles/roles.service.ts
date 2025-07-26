import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleWithActions } from './types/role.type';
import { CreateRoleInput } from './types/create-role.input';
import { UpdateRoleInput } from './types/update-role.input';

@Injectable()
export class RolesService {
	constructor(private prisma: PrismaService) {}

	create(input: CreateRoleInput): Promise<RoleWithActions> {
		return this.prisma.role.create({
			data: {
				name: input.name,
				roleActions: {
					createMany: {
						data:
							input.actionIds?.map((id) => ({
								actionId: id,
							})) || [],
					},
				},
			},
			include: { roleActions: true },
		});
	}

	findAll(): Promise<RoleWithActions[]> {
		return this.prisma.role.findMany({
			include: { roleActions: true },
		});
	}

	async findOne(id: number, exception?: HttpException): Promise<RoleWithActions> {
		const role = await this.prisma.role.findUnique({
			where: { id },
			include: { roleActions: true },
		});

		if (!role) throw exception ?? new NotFoundException('messages.resourceNotFound');

		return role;
	}

	async update(id: number, input: UpdateRoleInput): Promise<RoleWithActions> {
		await this.findOne(id);

		return this.prisma.role.update({
			where: { id },
			data: {
				name: input.name,
				...(input.actionIds && {
					roleActions: {
						deleteMany: {},
						createMany: {
							data: input.actionIds.map((actionId) => ({
								actionId: actionId,
							})),
						},
					},
				}),
			},
			include: { roleActions: true },
		});
	}

	async remove(id: number): Promise<void> {
		await this.findOne(id);

		await this.prisma.role.delete({
			where: { id },
		});
	}

	async findOneByName(name: string, exception?: HttpException): Promise<RoleWithActions> {
		const role = await this.prisma.role.findUnique({
			where: { name },
			include: { roleActions: true },
		});

		if (!role) throw exception ?? new NotFoundException('messages.resourceNotFound');

		return role;
	}
}
