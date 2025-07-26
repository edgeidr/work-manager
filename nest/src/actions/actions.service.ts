import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActionInput } from './types/create-action.input';
import { Action } from '@prisma/client';
import { UpdateActionInput } from './types/update-action.input';

@Injectable()
export class ActionsService {
	constructor(private prisma: PrismaService) {}

	create(input: CreateActionInput): Promise<Action> {
		return this.prisma.action.create({
			data: {
				name: input.name,
			},
		});
	}

	findAll(): Promise<Action[]> {
		return this.prisma.action.findMany();
	}

	async findOne(id: number, exception?: HttpException): Promise<Action> {
		const action = await this.prisma.action.findUnique({
			where: { id },
		});

		if (!action) throw exception ?? new NotFoundException('messages.resourceNotFound');

		return action;
	}

	async update(id: number, input: UpdateActionInput): Promise<Action> {
		await this.findOne(id);

		return this.prisma.action.update({
			where: { id },
			data: {
				name: input.name,
			},
		});
	}

	async remove(id: number): Promise<void> {
		await this.findOne(id);

		await this.prisma.action.delete({
			where: { id },
		});
	}
}
