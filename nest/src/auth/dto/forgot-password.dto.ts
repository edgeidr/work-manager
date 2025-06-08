import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
	@IsEmail({}, { message: 'validation.invalidEmail' })
	@IsNotEmpty({ message: 'validation.required' })
	email: string;
}
