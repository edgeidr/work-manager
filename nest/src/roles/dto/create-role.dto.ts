import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsArray()
	@Type(() => Number)
	@IsInt({ each: true })
	@IsOptional()
	actionIds?: number[];
}
