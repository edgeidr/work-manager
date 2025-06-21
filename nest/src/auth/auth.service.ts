import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { verify } from 'argon2';
import { SignInDto } from './dto/sign-in.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private tokensService: TokensService,
		private usersService: UsersService,
	) {}

	async signUp(signUpDto: SignUpDto) {
		const { email, password, firstName, lastName } = signUpDto;
		const user = this.usersService.createDefaultUser({ email, password, firstName, lastName });

		return user;
	}

	async signIn(signInDto: SignInDto) {
		const { email, password, staySignedIn } = signInDto;
		const user = await this.usersService.findOneByEmailWithPassword(email, false);

		if (!user) throw new UnauthorizedException('messages.invalidCredentials');

		const { password: userPassword, ...userData } = user;
		const passwordMatches = await verify(userPassword, password);

		if (!passwordMatches) throw new UnauthorizedException('messages.invalidCredentials');

		const { deviceId, accessToken, refreshToken } = await this.tokensService.createSession(
			user.id,
			email,
			staySignedIn,
		);

		return {
			deviceId,
			accessToken,
			refreshToken,
			user: userData,
		};
	}

	async signOut(deviceId: string) {
		await this.tokensService.removeSession(deviceId);
	}

	async resetPassword(newPassword: string, token: string) {
		const { userId } = await this.tokensService.validatePasswordResetToken(
			token,
			new BadRequestException('messages.tryAgain'),
		);

		await this.usersService.updatePassword(newPassword, userId);

		await this.tokensService.removePasswordResetTokensForUser(userId);

		return true;
	}

	async rotateRefreshToken(deviceId: string, oldRefreshToken: string, refreshTokenDto: RefreshTokenDto) {
		const session = await this.prisma.session.findFirst({
			where: {
				deviceId: deviceId,
				refreshToken: {
					value: oldRefreshToken,
				},
			},
			include: {
				user: true,
			},
		});

		if (!session) throw new UnauthorizedException();

		const { id: userId, email } = session.user;
		const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.tokensService.createSession(
			userId,
			email,
			refreshTokenDto.staySignedIn,
		);

		await this.prisma.session.update({
			where: { id: session.id },
			data: {
				accessToken: {
					update: {
						value: newAccessToken.value,
						expiresAt: newAccessToken.expiresAt,
					},
				},
				refreshToken: {
					update: {
						value: newRefreshToken.value,
						expiresAt: newRefreshToken.expiresAt,
					},
				},
			},
		});

		return {
			deviceId,
			accessToken: {
				value: newAccessToken.value,
				totalDuration: newAccessToken.totalDuration,
			},
			refreshToken: {
				value: newRefreshToken.value,
				totalDuration: newRefreshToken.totalDuration,
			},
		};
	}
}
