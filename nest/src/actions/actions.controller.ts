import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseIntPipe,
	UseGuards,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateActionInput } from './types/create-action.input';
import { UpdateActionInput } from './types/update-action.input';

@UseGuards(JwtGuard)
@Controller('actions')
export class ActionsController {
	constructor(private readonly actionsService: ActionsService) {}

	@Post()
	create(@Body() createActionDto: CreateActionDto) {
		const payload: CreateActionInput = { name: createActionDto.name };

		return this.actionsService.create(payload);
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
		const payload: UpdateActionInput = { name: updateActionDto.name };

		return this.actionsService.update(id, payload);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number) {
		await this.actionsService.remove(id);
	}
}
