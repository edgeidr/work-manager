import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		config: ConfigService,
		private prisma: PrismaService,
	) {
		super({
			jwtFromRequest: (req: Request) => req.cookies['accessToken'] || null,
			secretOrKey: config.get('JWT_ACCESS_TOKEN_SECRET', ''),
			passReqToCallback: true,
		});
	}

	async validate(request: Request, payload: { sub: number; email: string }) {
		const deviceId = request.cookies['deviceId'];
		const accessToken = request.cookies['accessToken'];

		const session = await this.prisma.session.findFirst({
			where: {
				userId: payload.sub,
				deviceId,
				accessToken: {
					value: accessToken,
				},
				user: {
					isActive: true,
				},
			},
			include: {
				user: {
					include: {
						userRoles: true,
						userActions: true,
					},
					omit: {
						password: true,
					},
				},
			},
		});

		if (!session) throw new UnauthorizedException();

		return session.user;
	}
}
