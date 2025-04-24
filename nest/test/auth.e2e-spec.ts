import * as pactum from 'pactum';
import { setupApp, teardownApp } from './utils/setup';
import { HttpStatus } from '@nestjs/common';
import { notEquals, notIncludes } from 'pactum-matchers';

describe('Auth E2E', () => {
	beforeAll(setupApp);
	afterAll(teardownApp);

	const mockUser = {
		email: 'test@test.com',
		password: 'p@ssword',
		firstName: 'Test',
		lastName: 'Data',
		roleIds: [1], // should be ignored by DTO
	};

	describe('Signup', () => {
		const url = '/auth/signup';
		const mockData = { ...mockUser };

		it('should throw if email is empty', () => {
			const { email, ...mockUserData } = mockData;
			return pactum.spec().post(url).withBody(mockUserData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if password is empty', () => {
			const { password, ...mockUserData } = mockData;
			return pactum.spec().post(url).withBody(mockUserData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if firstName is empty', () => {
			const { firstName, ...mockUserData } = mockData;
			return pactum.spec().post(url).withBody(mockUserData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if lastName is empty', () => {
			const { lastName, ...mockUserData } = mockData;
			return pactum.spec().post(url).withBody(mockUserData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if no body is provided', () => {
			return pactum.spec().post(url).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should signup', () => {
			return pactum
				.spec()
				.post(url)
				.withBody(mockData)
				.expectStatus(HttpStatus.CREATED)
				.expectJsonLike({
					email: mockUser.email,
					firstName: mockUser.firstName,
					lastName: mockUser.lastName,
				})
				.expectJsonMatch({
					userRoles: mockUser.roleIds.map((roleId) => ({
						roleId: notEquals(roleId),
					})),
				})
				.stores('mockUserId', 'id')
				.inspect();
		});
	});

	describe('Signin', () => {
		const url = '/auth/signin';
		const mockData = {
			email: mockUser.email,
			password: mockUser.password,
		};

		it('should throw if email is empty', () => {
			const { email, ...mockUserData } = mockData;
			return pactum.spec().post(url).withBody(mockUserData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if password is empty', () => {
			const { password, ...mockUserData } = mockData;
			return pactum.spec().post(url).withBody(mockUserData).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if no body is provided', () => {
			return pactum.spec().post(url).expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if email does not exist', () => {
			const mockUserData = {
				email: 'invalid@test.gmail.com',
				password: mockUser.password,
			};

			return pactum.spec().post(url).withBody(mockUserData).expectStatus(HttpStatus.UNAUTHORIZED);
		});

		it('should throw if password is incorrect', () => {
			const mockUserData = {
				email: mockUser.email,
				password: 'invalidpassword',
			};

			return pactum.spec().post(url).withBody(mockUserData).expectStatus(HttpStatus.UNAUTHORIZED);
		});

		it('should signin', () => {
			return pactum
				.spec()
				.post(url)
				.withBody(mockData)
				.expectStatus(HttpStatus.OK)
				.expectBodyContains('accessToken')
				.stores('accessToken', 'accessToken');
		});
	});

	describe('Delete mock data', () => {
		const url = '/users/{id}';

		it('should return mock user', () => {
			return pactum
				.spec()
				.get(url)
				.withPathParams('id', '$S{mockUserId}')
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectJsonLike({
					email: mockUser.email,
					firstName: mockUser.firstName,
					lastName: mockUser.lastName,
				});
		});

		it('should delete mock user', () => {
			return pactum
				.spec()
				.delete(url)
				.withPathParams('id', '$S{mockUserId}')
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectJsonLike({
					email: mockUser.email,
					firstName: mockUser.firstName,
					lastName: mockUser.lastName,
				});
		});
	});
});
