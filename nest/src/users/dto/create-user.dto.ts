import { Scope } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsEmail,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

export class UserActionDto {
	@IsNotEmpty()
	@IsInt()
	actionId: number;

	@IsNotEmpty()
	@IsEnum(Scope)
	scope: Scope;
}

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

	@IsNotEmpty()
	@IsBoolean()
	isActive: boolean;

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
