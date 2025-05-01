import { HttpStatus } from '@nestjs/common';
import * as pactum from 'pactum';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const itShouldThrowIfUnauthenticated = (method: HttpMethod, url: string) => {
	it('should throw if unauthenticated', () => {
		return pactum.spec()[method](url).expectStatus(HttpStatus.UNAUTHORIZED);
	});
};

const signInAsSuperuser = () => {
	describe('Signin', () => {
		const url = '/auth/signin';
		const superadminCredentials = {
			email: 'superadmin@gmail.com',
			password: 'p@ssword',
		};

		it('should signin', () => {
			return pactum
				.spec()
				.post(url)
				.withBody(superadminCredentials)
				.expectStatus(HttpStatus.OK)
				.expectBodyContains('accessToken')
				.expectBodyContains('refreshToken')
				.expectBodyContains('deviceId')
				.expectBodyContains('user')
				.stores('accessToken', 'accessToken')
				.stores('refreshToken', 'refreshToken')
				.stores('deviceId', 'deviceId')
				.stores('user', 'user');
		});
	});
};

export { itShouldThrowIfUnauthenticated, signInAsSuperuser };
