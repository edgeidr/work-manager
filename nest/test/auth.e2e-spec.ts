import * as pactum from 'pactum';
import { setupApp, teardownApp } from './utils/setup';
import { HttpStatus } from '@nestjs/common';
import { notEquals } from 'pactum-matchers';
import { itShouldThrowIfUnauthenticated } from './utils/shared-auth-test';

describe('Auth E2E', () => {
	beforeAll(setupApp);
	afterAll(teardownApp);

	const mockAuthUserData = {
		email: 'test@test.com',
		password: 'p@ssword',
		firstName: 'Test',
		lastName: 'Data',
		roleIds: [1], // should be ignored by DTO
	};

	let cookies;

	describe('Signup', () => {
		const url = '/auth/signup';
		const mockUserData = { ...mockAuthUserData };

		it('should throw if email is empty', () => {
			const { email, ...mockData } = mockUserData;
			return pactum.spec().post(url).withBody(mockData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if password is empty', () => {
			const { password, ...mockData } = mockUserData;
			return pactum.spec().post(url).withBody(mockData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if firstName is empty', () => {
			const { firstName, ...mockData } = mockUserData;
			return pactum.spec().post(url).withBody(mockData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if lastName is empty', () => {
			const { lastName, ...mockData } = mockUserData;
			return pactum.spec().post(url).withBody(mockData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if no body is provided', () => {
			return pactum.spec().post(url).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should signup', () => {
			const mockData = { ...mockUserData };

			return pactum
				.spec()
				.post(url)
				.withBody(mockUserData)
				.expectStatus(HttpStatus.CREATED)
				.expectJsonMatch({
					email: mockData.email,
					firstName: mockData.firstName,
					lastName: mockData.lastName,
					userRoles: mockData.roleIds.map((roleId) => ({
						roleId: notEquals(roleId),
					})),
				})
				.stores('mockUserId', 'id');
		});
	});

	describe('Signin', () => {
		const url = '/auth/signin';
		const mockUserData = {
			email: mockAuthUserData.email,
			password: mockAuthUserData.password,
		};

		it('should throw if email is empty', () => {
			const { email, ...mockData } = mockUserData;
			return pactum.spec().post(url).withBody(mockData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if password is empty', () => {
			const { password, ...mockData } = mockUserData;
			return pactum.spec().post(url).withBody(mockData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if no body is provided', () => {
			return pactum.spec().post(url).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if email does not exist', () => {
			const mockData = {
				email: 'invalid@test.gmail.com',
				password: mockUserData.password,
			};

			return pactum.spec().post(url).withBody(mockData).expectStatus(HttpStatus.UNAUTHORIZED);
		});

		it('should throw if password is incorrect', () => {
			const mockData = {
				email: mockUserData.email,
				password: 'invalidpassword',
			};

			return pactum.spec().post(url).withBody(mockData).expectStatus(HttpStatus.UNAUTHORIZED);
		});

		it('should signin', async () => {
			const mockData = { ...mockUserData };

			const res = await pactum
				.spec()
				.post(url)
				.withBody(mockData)
				.expectStatus(HttpStatus.OK)
				.expectBodyContains('user')
				.stores('user', 'user')
				.stores('cookies', 'res.headers.set-cookie');
		});
	});

	describe('Refresh token', () => {
		const url = '/auth/refresh';
		const mockRefreshData = {
			staySignedIn: true,
		};

		it('should refresh token with shorter expiry', () => {
			const mockData = {};

			return pactum
				.spec()
				.post(url)
				.withCookies('$S{cookies}')
				.withBody(mockData)
				.expectStatus(HttpStatus.NO_CONTENT)
				.stores('cookies', 'res.headers.set-cookie');
		});

		it('should refresh token with longer expiry', () => {
			const mockData = { ...mockRefreshData };
			return pactum
				.spec()
				.post(url)
				.withCookies('$S{cookies}')
				.withBody(mockData)
				.expectStatus(HttpStatus.NO_CONTENT)
				.stores('cookies', 'res.headers.set-cookie');
		});
	});

	describe('Delete mock data', () => {
		const url = '/users/{id}';
		const mockUserData = { ...mockAuthUserData };

		itShouldThrowIfUnauthenticated('delete', url);

		it('should delete mock user', () => {
			const mockData = { ...mockUserData };

			return pactum
				.spec()
				.delete(url)
				.withCookies('$S{cookies}')
				.withPathParams('id', '$S{mockUserId}')
				.expectStatus(HttpStatus.OK)
				.expectJsonMatch({
					id: '$S{mockUserId}',
					email: mockData.email,
					firstName: mockData.firstName,
					lastName: mockData.lastName,
				});
		});
	});
});
