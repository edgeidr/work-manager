import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { hash, verify } from 'argon2';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService,
	) {}

	async signUp(signUpDto: SignUpDto) {
		const userRole = await this.prisma.role.findUnique({
			where: {
				name: 'User',
			},
			include: {
				roleActions: true,
			},
		});

		if (!userRole) throw new UnauthorizedException();

		const hashedPassword = await hash(signUpDto.password);
		const user = await this.prisma.user.create({
			data: {
				email: signUpDto.email,
				password: hashedPassword,
				firstName: signUpDto.firstName,
				lastName: signUpDto.lastName,
				isActive: true,
				userRoles: {
					create: {
						roleId: userRole.id,
					},
				},
				userActions: {
					createMany: {
						data: userRole.roleActions.map(({ actionId }) => ({
							actionId: actionId,
							scope: 'OWN',
						})),
					},
				},
			},
			omit: {
				password: true,
			},
			include: {
				userRoles: true,
				userActions: true,
			},
		});

		return user;
	}

	async signIn(signInDto: SignInDto) {
		const user = await this.prisma.user.findFirst({
			where: {
				email: signInDto.email,
				isActive: true,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				password: true,
				userActions: true,
				userRoles: true,
			},
		});

		if (!user) throw new UnauthorizedException('messages.invalidCredentials');

		const { password, ...userData } = user;
		const passwordMatches = await verify(password, signInDto.password);

		if (!passwordMatches) throw new UnauthorizedException('messages.invalidCredentials');

		const { deviceId, accessToken, refreshToken } = await this.generateTokens(
			user.id,
			user.email,
			signInDto.staySignedIn,
		);

		await this.prisma.session.upsert({
			where: {
				userId_deviceId: {
					userId: user.id,
					deviceId: deviceId,
				},
			},
			create: {
				userId: user.id,
				deviceId: deviceId,
				accessToken: {
					create: {
						value: accessToken.value,
						expiresAt: accessToken.expiresAt,
					},
				},
				refreshToken: {
					create: {
						value: refreshToken.value,
						expiresAt: refreshToken.expiresAt,
					},
				},
			},
			update: {
				accessToken: {
					update: {
						value: accessToken.value,
						expiresAt: accessToken.expiresAt,
					},
				},
				refreshToken: {
					update: {
						value: refreshToken.value,
						expiresAt: refreshToken.expiresAt,
					},
				},
			},
		});

		return {
			deviceId,
			accessToken: {
				value: accessToken.value,
				totalDuration: accessToken.totalDuration,
			},
			refreshToken: {
				value: refreshToken.value,
				totalDuration: refreshToken.totalDuration,
			},
			user: userData,
		};
	}

	async signOut(deviceId: string) {
		await this.prisma.session.deleteMany({
			where: { deviceId },
		});
	}

	async resetPassword(newPassword: string, token: string) {
		const passwordResetToken = await this.prisma.passwordResetToken.findUnique({
			where: {
				value: token,
				used: false,
				expiresAt: { gt: new Date() },
			},
			select: { userId: true },
		});

		if (!passwordResetToken) throw new BadRequestException('messages.tryAgain');

		await this.prisma.user.update({
			where: { id: passwordResetToken.userId },
			data: { password: newPassword },
			omit: { password: true },
		});

		await this.prisma.passwordResetToken.deleteMany({
			where: { userId: passwordResetToken.userId },
		});

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
		const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.generateTokens(
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

	async generateTokens(
		userId: number,
		email: string,
		staySignedIn: boolean,
	): Promise<{
		deviceId: string;
		accessToken: { value: string; expiresAt: Date; totalDuration: number };
		refreshToken: { value: string; expiresAt: Date; totalDuration: number };
	}> {
		const accessTokenDuration = this.config.get('ACCESS_TOKEN_DURATION_IN_MINUTES', 60);
		const refreshTokenDuration = staySignedIn
			? this.config.get('REFRESH_TOKEN_DURATION_LONG_IN_MINUTES', 1440)
			: this.config.get('REFRESH_TOKEN_DURATION_IN_MINUTES', 10080);
		const accessTokenTotalDuration = accessTokenDuration * 1000 * 60;
		const refreshTokenTotalDuration = refreshTokenDuration * 1000 * 60;
		const accessTokenExpiration = new Date(Date.now() + accessTokenTotalDuration);
		const refreshTokenExpiration = new Date(Date.now() + refreshTokenTotalDuration);
		const deviceId = randomUUID();

		const payload = {
			sub: userId,
			email,
			deviceId,
		};

		const accessToken = await this.jwt.signAsync(payload, {
			secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
		});

		const refreshToken = await this.jwt.signAsync(payload, {
			secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
		});

		return {
			deviceId,
			accessToken: {
				value: accessToken,
				expiresAt: accessTokenExpiration,
				totalDuration: accessTokenTotalDuration,
			},
			refreshToken: {
				value: refreshToken,
				expiresAt: refreshTokenExpiration,
				totalDuration: refreshTokenTotalDuration,
			},
		};
	}
}
