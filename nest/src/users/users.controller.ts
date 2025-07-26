import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { Auth } from '../auth/auth.decorator';
import { User } from './types/user.type';
import { CreateUserInput } from './types/create-user.input';
import { UpdateUserInput } from './types/update-user.input';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me')
	getMe(@Auth() user: User) {
		return this.usersService.getMe(user);
	}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		const payload: CreateUserInput = {
			email: createUserDto.email,
			password: createUserDto.password,
			firstName: createUserDto.firstName,
			lastName: createUserDto.lastName,
			isActive: createUserDto.isActive,
			roleIds: createUserDto.roleIds,
			userActions: createUserDto.userActions,
		};

		return this.usersService.create(payload);
	}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
		const payload: UpdateUserInput = {
			email: updateUserDto.email,
			firstName: updateUserDto.firstName,
			lastName: updateUserDto.lastName,
			isActive: updateUserDto.isActive,
			roleIds: updateUserDto.roleIds,
			userActions: updateUserDto.userActions,
		};

		return this.usersService.update(id, payload);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.remove(id);
	}
}
