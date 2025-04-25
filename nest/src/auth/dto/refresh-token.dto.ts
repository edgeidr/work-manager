import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
	@IsNotEmpty()
	@IsString()
	refreshToken: string;

	@IsOptional()
	@IsBoolean()
	keepMeLoggedIn: boolean = false;
}
