import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { hash, verify } from 'argon2';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

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
		const user = await this.prisma.user.findUnique({
			where: {
				email: signInDto.email,
			},
		});

		if (!user) throw new UnauthorizedException('Account does not exist!');

		const passwordMatches = await verify(user.password, signInDto.password);

		if (!passwordMatches) throw new UnauthorizedException('Account does not exist');

		const { accessToken, refreshToken } = await this.signToken(user.id, user.email);
		const accessTokenDuration = this.config.get('ACCESS_TOKEN_DURATION_IN_MINUTES', 60);
		const refreshTokenDuration = signInDto.keepMeLoggedIn
			? this.config.get('REFRESH_TOKEN_DURATION_LONG_IN_MINUTES', 60)
			: this.config.get('REFRESH_TOKEN_DURATION_IN_MINUTES', 43200);
		const accessTokenExpiration = new Date(Date.now() + accessTokenDuration * 1000 * 60);
		const refreshTokenExpiration = new Date(Date.now() + refreshTokenDuration * 1000 * 60);
		const deviceId = randomUUID();

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				sessions: {
					create: {
						deviceId: deviceId,
						accessToken: {
							create: {
								value: accessToken,
								expiresAt: accessTokenExpiration,
							},
						},
						refreshToken: {
							create: {
								value: refreshToken,
								expiresAt: refreshTokenExpiration,
							},
						},
					},
				},
			},
		});

		return { accessToken, refreshToken, deviceId };
	}

	signOut() {
		return 'signOut';
	}

	async signToken(userId: number, email: string): Promise<{ accessToken: string; refreshToken: string }> {
		const payload = {
			sub: userId,
			email,
		};

		const accessToken = await this.jwt.signAsync(payload, {
			secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
		});

		const refreshToken = await this.jwt.signAsync(payload, {
			secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
		});

		return { accessToken, refreshToken };
	}
}
