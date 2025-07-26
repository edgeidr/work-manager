import { UserActionDto } from './user-action.dto';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	password: string;

	@IsNotEmpty()
	@IsString()
	firstName: string;

	@IsNotEmpty()
	@IsString()
	lastName: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean = true;

	@IsOptional()
	@IsArray()
	@Type(() => Number)
	@IsInt({ each: true })
	roleIds?: number[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UserActionDto)
	userActions?: UserActionDto[];
}
