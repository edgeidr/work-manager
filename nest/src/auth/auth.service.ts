import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
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
