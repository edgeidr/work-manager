import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordResetToken, Session, User } from '@prisma/client';
import { SessionType } from './types/session.type';
import { CreateSessionInput } from './types/create-session.input';
import { FindSessionInput } from './types/find-session.input';
import { UpdateSessionInput } from './types/update-session.input';
import { GenerateAccessTokenInput } from './types/generate-access-token.input';
import { GenerateRefreshTokenInput } from './types/generate-refresh-token.input';
import { Token } from './types/token.type';

@Injectable()
export class TokensService {
	constructor(
		private config: ConfigService,
		private jwt: JwtService,
		private prisma: PrismaService,
	) {}

	async createSession(input: CreateSessionInput): Promise<SessionType> {
		const deviceId = randomUUID();

		const accessToken = await this.generateAccessToken({
			userId: input.userId,
			email: input.email,
			deviceId,
		});

		const refreshToken = await this.generateRefreshToken({
			userId: input.userId,
			email: input.email,
			deviceId,
			staySignedIn: input.staySignedIn,
		});

		await this.prisma.session.create({
			data: {
				userId: input.userId,
				deviceId,
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
		});

		return {
			deviceId,
			accessToken,
			refreshToken,
		};
	}

	async findSession(input: FindSessionInput, exception?: HttpException): Promise<Session & { user: User }> {
		const session = await this.prisma.session.findFirst({
			where: {
				deviceId: input.deviceId,
				refreshToken: {
					value: input.refreshToken,
				},
			},
			include: { user: true },
		});

		if (!session) throw exception ?? new NotFoundException('messages.resourceNotFound');

		return session;
	}

	async updateSession(input: UpdateSessionInput, exception?: HttpException): Promise<SessionType> {
		const { id, user } = await this.findSession(
			{
				deviceId: input.deviceId,
				refreshToken: input.refreshToken,
			},
			exception,
		);

		const accessToken = await this.generateAccessToken({
			userId: user.id,
			email: user.email,
			deviceId: input.deviceId,
		});

		const refreshToken = await this.generateRefreshToken({
			userId: user.id,
			email: user.email,
			deviceId: input.deviceId,
			staySignedIn: input.staySignedIn,
		});

		await this.prisma.session.update({
			where: { id },
			data: {
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
			deviceId: input.deviceId,
			accessToken,
			refreshToken,
		};
	}

	async removeSession(deviceId: string): Promise<void> {
		await this.prisma.session.deleteMany({
			where: { deviceId },
		});
	}

	async validatePasswordResetToken(token: string, exception?: HttpException): Promise<PasswordResetToken> {
		const passwordResetToken = await this.prisma.passwordResetToken.findUnique({
			where: {
				value: token,
				used: false,
				expiresAt: { gt: new Date() },
			},
		});

		if (!passwordResetToken) throw exception ?? new NotFoundException('messages.resourceNotFound');

		return passwordResetToken;
	}

	async removePasswordResetTokensForUser(userId: number): Promise<void> {
		await this.prisma.passwordResetToken.deleteMany({
			where: { userId },
		});
	}

	private async generateAccessToken(input: GenerateAccessTokenInput): Promise<Token> {
		const accessTokenDuration = this.config.get('ACCESS_TOKEN_DURATION_IN_MINUTES', 60);
		const accessTokenTotalDuration = accessTokenDuration * 1000 * 60;
		const accessTokenExpiration = new Date(Date.now() + accessTokenTotalDuration);
		const payload = {
			sub: input.userId,
			email: input.email,
			deviceId: input.deviceId,
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

	private async generateRefreshToken(input: GenerateRefreshTokenInput): Promise<Token> {
		const refreshTokenDuration = input.staySignedIn
			? this.config.get('REFRESH_TOKEN_DURATION_LONG_IN_MINUTES', 1440)
			: this.config.get('REFRESH_TOKEN_DURATION_IN_MINUTES', 10080);
		const refreshTokenTotalDuration = refreshTokenDuration * 1000 * 60;
		const refreshTokenExpiration = new Date(Date.now() + refreshTokenTotalDuration);
		const payload = {
			sub: input.userId,
			email: input.email,
			deviceId: input.deviceId,
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
