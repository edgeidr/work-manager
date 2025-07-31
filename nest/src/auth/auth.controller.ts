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
import { SignUpInput } from './inputs/sign-up.input';
import { SignInInput } from './inputs/sign-in.input';
import { User } from '../users/types/user.type';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private configService: ConfigService,
	) {}

	@Post('signup')
	signUp(@Body() signUpDto: SignUpDto) {
		const payload: SignUpInput = {
			email: signUpDto.email,
			password: signUpDto.password,
			firstName: signUpDto.firstName,
			lastName: signUpDto.lastName,
		};

		return this.authService.signUp(payload);
	}

	@HttpCode(HttpStatus.OK)
	@Post('signin')
	async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) response: Response): Promise<User> {
		const payload: SignInInput = {
			email: signInDto.email,
			password: signInDto.password,
			staySignedIn: signInDto.staySignedIn,
		};

		const { session, user } = await this.authService.signIn(payload);
		const { refreshToken, accessToken, deviceId } = session;

		response.cookie('deviceId', deviceId, this.getCookieOptions(refreshToken.totalDuration));
		response.cookie('accessToken', accessToken.value, this.getCookieOptions(accessToken.totalDuration));
		response.cookie('refreshToken', refreshToken.value, this.getCookieOptions(refreshToken.totalDuration));

		return user;
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
		const { staySignedIn } = refreshTokenDto;
		const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
			await this.authService.rotateRefreshToken({ deviceId, oldRefreshToken, staySignedIn });

		response.cookie('deviceId', deviceId, this.getCookieOptions(newRefreshToken.totalDuration));
		response.cookie('accessToken', newAccessToken.value, this.getCookieOptions(newAccessToken.totalDuration));
		response.cookie('refreshToken', newRefreshToken.value, this.getCookieOptions(newRefreshToken.totalDuration));
	}

	@Post('forgot-password')
	forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		return this.authService.forgotPassword(forgotPasswordDto.email);
	}

	@Post('reset-password')
	async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		const { newPassword, token } = resetPasswordDto;
		await this.authService.resetPassword({ password: newPassword, token });
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
