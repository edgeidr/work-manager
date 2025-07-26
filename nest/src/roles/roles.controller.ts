import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { UpdateRoleInput } from './types/update-role.input';
import { CreateRoleInput } from './types/create-role.input';

@UseGuards(JwtGuard)
@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	@Post()
	create(@Body() createRoleDto: CreateRoleDto) {
		const payload: CreateRoleInput = {
			name: createRoleDto.name,
			actionIds: createRoleDto.actionIds,
		};

		return this.rolesService.create(payload);
	}

	@Get()
	findAll() {
		return this.rolesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.rolesService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
		const payload: UpdateRoleInput = {
			name: updateRoleDto.name,
			actionIds: updateRoleDto.actionIds,
		};

		return this.rolesService.update(id, payload);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.rolesService.remove(id);
	}
}
