import { IsEmail, IsNotEmpty, isNotEmpty, IsString } from 'class-validator';

export class SignInDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}
