import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { Match } from '../../common/match.decorator';

export class ResetPasswordDto {
	@IsString({ message: 'validation.invalidType' })
	@IsStrongPassword({}, { message: 'validation.passwordNotStrong' })
	password: string;

	@IsString({ message: 'validation.invalidType' })
	@Match('password', { message: 'validation.passwordMismatch' })
	confirmPassword: string;

	@IsString({ message: 'validation.invalidType' })
	@IsNotEmpty({ message: 'validation.required' })
	token: string;
}
