import { IsBoolean, IsOptional } from 'class-validator';

export class RefreshTokenDto {
	@IsOptional()
	@IsBoolean()
	staySignedIn: boolean = false;
}
