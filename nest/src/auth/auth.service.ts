import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { hash } from 'argon2';

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

	signIn() {
		return 'signin';
	}

	signOut() {
		return 'signOut';
	}
}
