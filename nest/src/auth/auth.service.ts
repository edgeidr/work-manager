import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	signUp() {
		return 'signup';
	}

	signIn() {
		return 'signin';
	}

	signOut() {
		return 'signOut';
	}
}
