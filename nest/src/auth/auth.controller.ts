import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('signup')
	signUp(@Body() signUpDto: SignUpDto) {
		return this.authService.signUp(signUpDto);
	}

	@HttpCode(200)
	@Post('signin')
	signIn(@Body() signInDto: SignInDto) {
		return this.authService.signIn(signInDto);
	}

	@HttpCode(200)
	@Post('signOut')
	signOut() {
		return this.authService.signOut();
	}

	@HttpCode(200)
	@Post('refresh')
	refreshToken(@Headers('device-id') deviceId: string, @Body() refreshTokenDto: RefreshTokenDto) {
		return this.authService.refreshToken(deviceId, refreshTokenDto);
	}
}
