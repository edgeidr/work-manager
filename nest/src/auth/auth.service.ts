import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { hash, verify } from 'argon2';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

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
			omit: {
				password: true,
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

		if (!user) throw new ForbiddenException('Account does not exist!');

		const { password, ...userData } = user;
		const passwordMatches = await verify(password, signInDto.password);

		if (!passwordMatches) throw new ForbiddenException('Account does not exist');

		return userData;
	}

	signOut() {
		return 'signOut';
	}
}
