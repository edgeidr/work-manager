import { OtpType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
	@IsEmail({}, { message: 'validation.invalidEmail' })
	@IsNotEmpty({ message: 'validation.required' })
	email: string;

	@IsNotEmpty({ message: 'validation.required' })
	@IsString({ message: 'validation.invalidType' })
	code: string;

	@IsEnum(OtpType)
	type: OtpType;
}
