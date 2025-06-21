import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { RoleWithActions } from '../common/types/role.type';

@Injectable()
export class RolesService {
	constructor(private prisma: PrismaService) {}

	create(createRoleDto: CreateRoleDto) {
		const { actionIds, ...createRoleData } = createRoleDto;

		return this.prisma.role.create({
			data: {
				...createRoleData,
				roleActions: {
					createMany: {
						data:
							actionIds?.map((id) => ({
								actionId: id,
							})) || [],
					},
				},
			},
			include: {
				roleActions: true,
			},
		});
	}

	findAll() {
		return this.prisma.role.findMany();
	}

	async findOne(id: number) {
		const role = await this.prisma.role.findUnique({
			where: { id },
			include: {
				roleActions: true,
			},
		});

		if (!role) throw new NotFoundException();

		return role;
	}

	async update(id: number, updateRoleDto: UpdateRoleDto) {
		await this.findOne(id);

		const { actionIds, ...updateRoleData } = updateRoleDto;

		return this.prisma.role.update({
			where: { id },
			data: {
				...updateRoleData,
				...(actionIds && {
					roleActions: {
						deleteMany: {},
						createMany: {
							data: actionIds.map((actionId) => ({
								actionId: actionId,
							})),
						},
					},
				}),
			},
			include: {
				roleActions: true,
			},
		});
	}

	async remove(id: number) {
		await this.findOne(id);

		return this.prisma.role.delete({
			where: { id },
			include: {
				roleActions: true,
			},
		});
	}

	async findOneByName(name: string): Promise<RoleWithActions> {
		const role = await this.prisma.role.findUnique({
			where: { name },
			include: { roleActions: true },
		});

		if (!role) throw new NotFoundException('messages.resourceNotFound');

		return role;
	}
}
