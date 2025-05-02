import * as pactum from 'pactum';
import { setupApp, teardownApp } from './utils/setup';
import { HttpStatus } from '@nestjs/common';
import { gte } from 'pactum-matchers';
import { itShouldThrowIfUnauthenticated, signInAsSuperuser } from './utils/shared-auth-test';
import { Scope } from '@prisma/client';

describe('Users E2E', () => {
	beforeAll(setupApp);
	afterAll(teardownApp);

	const mockUser = {
		email: 'test@test.com',
		password: 'password',
		firstName: 'Test',
		lastName: 'Data',
		isActive: true,
		roleIds: [1],
		userActions: [
			{
				actionId: 1,
				scope: Scope.ANY,
			},
		],
		ignoreField: 'IGNORE', // should be ignored by DTO
	};

	const mockUpdateData = {
		email: 'updated@test.com',
		firstName: 'Updated',
		lastName: 'Data',
		isActive: false,
		roleIds: [2],
		userActions: [
			{
				actionId: 2,
				scope: Scope.OWN,
			},
		],
		ignoreField: 'IGNORE', // should be ignored by DTO
	};

	signInAsSuperuser();

	describe('Get me', () => {
		const url = '/users/me';

		itShouldThrowIfUnauthenticated('get', url);

		it('should get current user', () => {
			return pactum
				.spec()
				.get(url)
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectBodyContains('email')
				.expectBodyContains('userRoles')
				.expectBodyContains('userActions');
		});
	});

	describe('Get users', () => {
		const url = '/users';

		itShouldThrowIfUnauthenticated('get', url);

		it('should get users', () => {
			return pactum
				.spec()
				.get(url)
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectJsonLength('.', gte(1));
		});
	});

	describe('Create user', () => {
		const url = '/users';
		const mockData = { ...mockUser };

		itShouldThrowIfUnauthenticated('post', url);

		it('should throw if email is empty', () => {
			const { email, ...mockUserData } = mockData;

			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockUserData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if password is empty', () => {
			const { password, ...mockUserData } = mockData;

			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockUserData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if firstName is empty', () => {
			const { firstName, ...mockUserData } = mockData;

			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockUserData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if lastName is empty', () => {
			const { lastName, ...mockUserData } = mockData;

			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockUserData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if isActive is empty', () => {
			const { isActive, ...mockUserData } = mockData;

			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockUserData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if no body is provided', () => {
			return pactum.spec().post(url).withBearerToken('$S{accessToken}').expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should create mock user', () => {
			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockData)
				.expectStatus(HttpStatus.CREATED)
				.expectJsonLike({
					email: mockUser.email,
					firstName: mockUser.firstName,
					lastName: mockUser.lastName,
					isActive: mockUser.isActive,
				})
				.expectBodyContains('id')
				.stores('mockUserId', 'id');
		});
	});

	describe('Get user by id', () => {
		const url = '/users/{id}';

		itShouldThrowIfUnauthenticated('get', url);

		it('should get mock user', () => {
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
					isActive: mockUser.isActive,
					userActions: mockUser.userActions,
					userRoles: mockUser.roleIds.map((roleId) => ({
						roleId: roleId,
					})),
				});
		});
	});

	describe('Edit user', () => {
		const url = '/users/{id}';

		itShouldThrowIfUnauthenticated('patch', url);

		it('should update mock user', () => {
			return pactum
				.spec()
				.patch(url)
				.withPathParams('id', '$S{mockUserId}')
				.withBearerToken('$S{accessToken}')
				.withBody(mockUpdateData)
				.expectStatus(HttpStatus.OK)
				.expectJsonLike({
					email: mockUpdateData.email,
					firstName: mockUpdateData.firstName,
					lastName: mockUpdateData.lastName,
					isActive: mockUpdateData.isActive,
					userActions: mockUpdateData.userActions,
					userRoles: mockUpdateData.roleIds.map((roleId) => ({
						roleId: roleId,
					})),
				});
		});
	});

	describe('Delete user', () => {
		const url = '/users/{id}';

		itShouldThrowIfUnauthenticated('delete', url);

		it('should delete mock user', () => {
			return pactum
				.spec()
				.delete(url)
				.withPathParams('id', '$S{mockUserId}')
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectJsonLike({
					email: mockUpdateData.email,
					firstName: mockUpdateData.firstName,
					lastName: mockUpdateData.lastName,
					isActive: mockUpdateData.isActive,
				});
		});
	});
});
