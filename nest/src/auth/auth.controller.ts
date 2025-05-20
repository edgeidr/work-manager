import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('signup')
	signUp(@Body() signUpDto: SignUpDto) {
		return this.authService.signUp(signUpDto);
	}

	@HttpCode(200)
	@Post('signin')
	async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) response: Response) {
		const { refreshToken, accessToken, deviceId, ...authData } = await this.authService.signIn(signInDto);

		response.cookie('deviceId', deviceId, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			maxAge: refreshToken.totalDuration,
		});

		response.cookie('accessToken', accessToken.value, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			maxAge: accessToken.totalDuration,
		});

		response.cookie('refreshToken', refreshToken.value, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			maxAge: refreshToken.totalDuration,
		});

		return authData;
	}

	@HttpCode(204)
	@Post('signOut')
	signOut(@Req() request: Request) {
		const deviceId = request.cookies['deviceId'];
		return this.authService.signOut(deviceId);
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

		response.cookie('deviceId', deviceId, {
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: newRefreshToken.totalDuration,
		});

		response.cookie('accessToken', newAccessToken.value, {
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: newAccessToken.totalDuration,
		});

		response.cookie('refreshToken', newRefreshToken.value, {
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: newRefreshToken.totalDuration,
		});

		return;
	}
}
