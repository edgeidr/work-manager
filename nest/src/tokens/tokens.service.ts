import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokensService {
	constructor(
		private config: ConfigService,
		private jwt: JwtService,
		private prisma: PrismaService,
	) {}

	async createSession(
		userId: number,
		email: string,
		staySignedIn: boolean,
	): Promise<{
		deviceId: string;
		accessToken: { value: string; expiresAt: Date; totalDuration: number };
		refreshToken: { value: string; expiresAt: Date; totalDuration: number };
	}> {
		const deviceId = randomUUID();
		const accessToken = await this.generateAccessToken(userId, email, deviceId);
		const refreshToken = await this.generateRefreshToken(userId, email, deviceId, staySignedIn);

		await this.prisma.session.upsert({
			where: {
				userId_deviceId: {
					userId: userId,
					deviceId: deviceId,
				},
			},
			create: {
				userId: userId,
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
			accessToken,
			refreshToken,
		};
	}

	async removeSession(deviceId: string) {
		await this.prisma.session.deleteMany({
			where: { deviceId },
		});
	}

	// async generateToken(type: )

	private async generateAccessToken(
		userId: number,
		email: string,
		deviceId: string,
	): Promise<{ value: string; expiresAt: Date; totalDuration: number }> {
		const accessTokenDuration = this.config.get('ACCESS_TOKEN_DURATION_IN_MINUTES', 60);
		const accessTokenTotalDuration = accessTokenDuration * 1000 * 60;
		const accessTokenExpiration = new Date(Date.now() + accessTokenTotalDuration);
		const payload = {
			sub: userId,
			email,
			deviceId,
		};

		const accessToken = await this.jwt.signAsync(payload, {
			secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
		});

		return {
			value: accessToken,
			expiresAt: accessTokenExpiration,
			totalDuration: accessTokenTotalDuration,
		};
	}

	private async generateRefreshToken(
		userId: number,
		email: string,
		deviceId: string,
		staySignedIn: boolean,
	): Promise<{ value: string; expiresAt: Date; totalDuration: number }> {
		const refreshTokenDuration = staySignedIn
			? this.config.get('REFRESH_TOKEN_DURATION_LONG_IN_MINUTES', 1440)
			: this.config.get('REFRESH_TOKEN_DURATION_IN_MINUTES', 10080);
		const refreshTokenTotalDuration = refreshTokenDuration * 1000 * 60;
		const refreshTokenExpiration = new Date(Date.now() + refreshTokenTotalDuration);
		const payload = {
			sub: userId,
			email,
			deviceId,
		};

		const refreshToken = await this.jwt.signAsync(payload, {
			secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
		});

		return {
			value: refreshToken,
			expiresAt: refreshTokenExpiration,
			totalDuration: refreshTokenTotalDuration,
		};
	}
}
