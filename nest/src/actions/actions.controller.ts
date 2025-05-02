import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('actions')
export class ActionsController {
	constructor(private readonly actionsService: ActionsService) {}

	@Post()
	create(@Body() createActionDto: CreateActionDto) {
		return this.actionsService.create(createActionDto);
	}

	@Get()
	findAll() {
		return this.actionsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.actionsService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() updateActionDto: UpdateActionDto) {
		return this.actionsService.update(id, updateActionDto);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.actionsService.remove(id);
	}
}
