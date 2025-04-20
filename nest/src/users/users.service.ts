import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

	async create(createUserDto: CreateUserDto) {
		const { password, roleIds, ...incompleteDto } = createUserDto;
		const hashedPassword = await hash(createUserDto.password);

		return this.prisma.user.create({
			data: {
				...incompleteDto,
				password: hashedPassword,
				roles: {
					connect: roleIds?.map((id) => ({ id })),
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

		return this.prisma.user.update({
			where: { id },
			data: { ...updateUserDto },
		});
	}

	async remove(id: number) {
		await this.findOne(id);

		return this.prisma.user.delete({
			where: { id },
		});
	}
}
