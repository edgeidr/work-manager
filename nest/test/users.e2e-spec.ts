import * as pactum from 'pactum';
import { setupApp, teardownApp } from './utils/setup';
import { HttpStatus } from '@nestjs/common';
import { gte } from 'pactum-matchers';
import { itShouldThrowIfUnauthenticated, signInAsSuperuser } from './utils/shared-auth-test';
import { Scope } from '@prisma/client';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';

describe('Users E2E', () => {
	beforeAll(setupApp);
	afterAll(teardownApp);

	const mockCreateUserData: CreateUserDto & { [key: string]: any } = {
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

	const mockUpdateUserData: UpdateUserDto & { [key: string]: any } = {
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
				.withCookies('$S{cookies}')
				.expectStatus(HttpStatus.OK)
				.expectBodyContains('userRoles')
				.expectBodyContains('userActions')
				.expectJsonMatch({
					email: '$S{user.email}',
					firstName: '$S{user.firstName}',
					lastName: '$S{user.lastName}',
				})
				.inspect();
		});
	});

	describe('Create user', () => {
		const url = '/users';
		const mockUserData = { ...mockCreateUserData };

		itShouldThrowIfUnauthenticated('post', url);

		it('should throw if email is empty', () => {
			const { email, ...mockData } = mockUserData;

			return pactum
				.spec()
				.post(url)
				.withCookies('$S{cookies}')
				.withBody(mockData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if password is empty', () => {
			const { password, ...mockData } = mockUserData;

			return pactum
				.spec()
				.post(url)
				.withCookies('$S{cookies}')
				.withBody(mockData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if firstName is empty', () => {
			const { firstName, ...mockData } = mockUserData;

			return pactum
				.spec()
				.post(url)
				.withCookies('$S{cookies}')
				.withBody(mockData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if lastName is empty', () => {
			const { lastName, ...mockData } = mockUserData;

			return pactum
				.spec()
				.post(url)
				.withCookies('$S{cookies}')
				.withBody(mockData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if isActive is empty', () => {
			const { isActive, ...mockData } = mockUserData;

			return pactum
				.spec()
				.post(url)
				.withCookies('$S{cookies}')
				.withBody(mockData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should throw if no body is provided', () => {
			return pactum.spec().post(url).withCookies('$S{cookies}').expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should create mock user', () => {
			const mockData = { ...mockUserData };

			return pactum
				.spec()
				.post(url)
				.withCookies('$S{cookies}')
				.withBody(mockData)
				.expectStatus(HttpStatus.CREATED)
				.expectBodyContains('id')
				.expectJsonMatch({
					email: mockData.email,
					firstName: mockData.firstName,
					lastName: mockData.lastName,
					isActive: mockData.isActive,
					...(mockData.roleIds && {
						userRoles: mockData.roleIds.map((roleId) => ({
							roleId,
						})),
					}),
					...(mockData.userActions && {
						userActions: mockData.userActions.map(({ actionId, scope }) => ({
							actionId,
							scope,
						})),
					}),
				})
				.stores('mockUserId', 'id');
		});
	});

	describe('Get users', () => {
		const url = '/users';

		itShouldThrowIfUnauthenticated('get', url);

		it('should get users', () => {
			return pactum
				.spec()
				.get(url)
				.withCookies('$S{cookies}')
				.expectStatus(HttpStatus.OK)
				.expectJsonLength('.', gte(1));
		});
	});

	describe('Get user by id', () => {
		const url = '/users/{id}';
		const mockUserData = { ...mockCreateUserData };

		itShouldThrowIfUnauthenticated('get', url);

		it('should get mock user', () => {
			const mockData = { ...mockUserData };

			return pactum
				.spec()
				.get(url)
				.withCookies('$S{cookies}')
				.withPathParams('id', '$S{mockUserId}')
				.expectStatus(HttpStatus.OK)
				.expectJsonMatch({
					email: mockData.email,
					firstName: mockData.firstName,
					lastName: mockData.lastName,
					isActive: mockData.isActive,
					...(mockData.userActions && {
						userActions: mockData.userActions,
					}),
					...(mockData.roleIds && {
						userRoles: mockData.roleIds.map((roleId) => ({
							roleId: roleId,
						})),
					}),
				});
		});
	});

	describe('Edit user by id', () => {
		const url = '/users/{id}';
		const mockUserData = { ...mockUpdateUserData };

		itShouldThrowIfUnauthenticated('patch', url);

		it('should update mock user', () => {
			const mockData = { ...mockUserData };

			return pactum
				.spec()
				.patch(url)
				.withCookies('$S{cookies}')
				.withPathParams('id', '$S{mockUserId}')
				.withBody(mockData)
				.expectStatus(HttpStatus.OK)
				.expectJsonMatch({
					email: mockData.email,
					firstName: mockData.firstName,
					lastName: mockData.lastName,
					isActive: mockData.isActive,
					...(mockData.userActions && {
						userActions: mockData.userActions,
					}),
					...(mockData.roleIds && {
						userRoles: mockData.roleIds.map((roleId) => ({
							roleId: roleId,
						})),
					}),
				});
		});
	});

	describe('Delete user by id', () => {
		const url = '/users/{id}';
		const mockUserData = { ...mockUpdateUserData };

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
					isActive: mockData.isActive,
					...(mockData.userActions && {
						userActions: mockData.userActions,
					}),
					...(mockData.roleIds && {
						userRoles: mockData.roleIds.map((roleId) => ({
							roleId: roleId,
						})),
					}),
				});
		});
	});
});
