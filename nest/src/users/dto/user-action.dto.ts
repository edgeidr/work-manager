import { Scope } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class UserActionDto {
	@IsNotEmpty()
	@IsInt()
	actionId: number;

	@IsNotEmpty()
	@IsEnum(Scope)
	scope: Scope;
}
