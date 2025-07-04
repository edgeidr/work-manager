import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CookieOptions, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { OtpsService } from '../otps/otps.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private configService: ConfigService,
		private otpsService: OtpsService,
	) {}

	@Post('signup')
	signUp(@Body() signUpDto: SignUpDto) {
		return this.authService.signUp(signUpDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('signin')
	async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) response: Response) {
		const { refreshToken, accessToken, deviceId, ...authData } = await this.authService.signIn(signInDto);

		response.cookie('deviceId', deviceId, this.getCookieOptions(refreshToken.totalDuration));
		response.cookie('accessToken', accessToken.value, this.getCookieOptions(accessToken.totalDuration));
		response.cookie('refreshToken', refreshToken.value, this.getCookieOptions(refreshToken.totalDuration));

		return authData;
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Post('signOut')
	async signOut(@Req() request: Request) {
		const deviceId = request.cookies['deviceId'];
		await this.authService.signOut(deviceId);
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@Post('refresh')
	async rotateRefreshToken(
		@Body() refreshTokenDto: RefreshTokenDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const deviceId = request.cookies['deviceId'];
		const oldRefreshToken = request.cookies['refreshToken'];
		const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
			await this.authService.rotateRefreshToken(deviceId, oldRefreshToken, refreshTokenDto);

		response.cookie('deviceId', deviceId, this.getCookieOptions(newRefreshToken.totalDuration));
		response.cookie('accessToken', newAccessToken.value, this.getCookieOptions(newAccessToken.totalDuration));
		response.cookie('refreshToken', newRefreshToken.value, this.getCookieOptions(newRefreshToken.totalDuration));

		return;
	}

	@Post('forgot-password')
	forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		return this.otpsService.sendOtp(forgotPasswordDto.email, 'FORGOT_PASSWORD');
	}

	@Post('reset-password')
	resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		const { newPassword, token } = resetPasswordDto;
		return this.authService.resetPassword(newPassword, token);
	}

	private getCookieOptions(maxAge: number): CookieOptions {
		const secureEnvironments = ['production', 'staging'];
		const useSecure = secureEnvironments.includes(this.configService.get('NODE_ENV', 'development'));
		const baseDomain = this.configService.get('COOKIE_DOMAIN', '');

		return {
			httpOnly: true,
			sameSite: 'strict',
			secure: useSecure,
			domain: baseDomain,
			maxAge,
		};
	}
}
