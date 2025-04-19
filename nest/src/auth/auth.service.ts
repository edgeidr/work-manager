import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { hash, verify } from 'argon2';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService,
	) {}

	async signUp(signUpDto: SignUpDto) {
		const hashedPassword = await hash(signUpDto.password);
		const user = await this.prisma.user.create({
			data: {
				email: signUpDto.email,
				password: hashedPassword,
				firstName: signUpDto.firstName,
				lastName: signUpDto.lastName,
				isActive: true,
			},
		});

		return this.signToken(user.id, user.email);
	}

	async signIn(signInDto: SignInDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: signInDto.email,
			},
		});

		if (!user) throw new ForbiddenException('Account does not exist!');

		const passwordMatches = await verify(user.password, signInDto.password);

		if (!passwordMatches) throw new ForbiddenException('Account does not exist');

		return this.signToken(user.id, user.email);
	}

	signOut() {
		return 'signOut';
	}

	async signToken(userId: number, email: string): Promise<{ accessToken: string }> {
		const payload = {
			sub: userId,
			email,
		};

		const token = await this.jwt.signAsync(payload, {
			expiresIn: '15m',
			secret: this.config.get('JWT_SECRET'),
		});

		return { accessToken: token };
	}
}
