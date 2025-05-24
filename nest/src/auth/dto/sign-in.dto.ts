import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignInDto {
	@IsEmail({}, { message: 'validation.invalidEmail' })
	@IsNotEmpty({ message: 'validation.required' })
	email: string;

	@IsString({ message: 'validation.invalidType' })
	@IsNotEmpty({ message: 'validation.required' })
	password: string;

	@IsOptional()
	@IsBoolean({ message: 'validation.invalidType' })
	keepMeLoggedIn: boolean = false;
}
