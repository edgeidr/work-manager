import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
	constructor(private prisma: PrismaService) {}

	create(createRoleDto: CreateRoleDto) {
		return this.prisma.role.create({
			data: {
				name: createRoleDto.name,
				actions: {
					connect: createRoleDto.actionIds?.map((id) => ({ id })),
				},
			},
		});
	}

	findAll() {
		return this.prisma.role.findMany();
	}

	async findOne(id: number) {
		const role = await this.prisma.role.findUnique({
			where: { id },
		});

		if (!role) throw new NotFoundException();

		return role;
	}

	async update(id: number, updateRoleDto: UpdateRoleDto) {
		await this.findOne(id);

		return this.prisma.role.update({
			where: { id },
			data: {
				name: updateRoleDto.name,
				actions: {
					set: updateRoleDto.actionIds?.map((id) => ({ id })),
				},
			},
		});
	}

	async remove(id: number) {
		await this.findOne(id);

		return this.prisma.role.delete({
			where: { id },
		});
	}
}
