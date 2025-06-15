import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActionsService {
	constructor(private prisma: PrismaService) {}

	create(createActionDto: CreateActionDto) {
		return this.prisma.action.create({
			data: { name: createActionDto.name },
		});
	}

	findAll() {
		return this.prisma.action.findMany();
	}

	async findOne(id: number) {
		const action = await this.prisma.action.findUnique({
			where: { id },
		});

		if (!action) throw new NotFoundException('messages.resourceNotFound');

		return action;
	}

	async update(id: number, updateActionDto: UpdateActionDto) {
		return this.prisma.action.update({
			where: { id },
			data: { name: updateActionDto.name },
		});
	}

	async remove(id: number) {
		await this.prisma.action.delete({
			where: { id },
		});
	}
}
