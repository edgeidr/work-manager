import { Equals, IsNotEmpty, IsString, Matches, ValidateIf } from 'class-validator';

export class ResetPasswordDto {
	@IsString({ message: 'validation.invalidType' })
	@IsNotEmpty({ message: 'validation.required' })
	newPassword: string;

	@IsString({ message: 'validation.invalidType' })
	@IsNotEmpty({ message: 'validation.required' })
	@Equals((object: any) => object.password, { message: 'validation.passwordMismatch' })
	confirmPassword: string;

	@IsString({ message: 'validation.invalidType' })
	@IsNotEmpty({ message: 'validation.required' })
	token: string;
}
