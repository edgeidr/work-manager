import * as pactum from 'pactum';
import { setupApp, teardownApp } from './utils/setup';
import { UpdateRoleDto } from '../src/roles/dto/update-role.dto';
import { CreateRoleDto } from '../src/roles/dto/create-role.dto';
import { itShouldThrowIfUnauthenticated, signInAsSuperuser } from './utils/shared-auth-test';
import { HttpStatus } from '@nestjs/common';
import { gte } from 'pactum-matchers';

describe('Roles E2E', () => {
	beforeAll(setupApp);
	afterAll(teardownApp);

	const mockCreateRoleData: CreateRoleDto & { [key: string]: any } = {
		name: 'Mock',
		actionIds: [1, 2, 3],
		ignoreField: 'IGNORE', // should be ignored by DTO
	};

	const mockUpdateRoleData: UpdateRoleDto & { [key: string]: any } = {
		name: 'MockUpdate',
		actionIds: [4, 5, 6],
		ignoreField: 'IGNORE', // should be ignored by DTO
	};

	signInAsSuperuser();

	describe('Create role', () => {
		const url = '/roles';
		const mockRoleData = { ...mockCreateRoleData };

		itShouldThrowIfUnauthenticated('post', url);

		it('should throw if name is empty', () => {
			const { name, ...mockData } = mockRoleData;

			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should create mock role', () => {
			const mockData = { ...mockCreateRoleData };

			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockData)
				.expectStatus(HttpStatus.CREATED)
				.expectBodyContains('id')
				.expectJsonLike({
					name: mockData.name,
					...(mockData.actionIds && {
						roleActions: mockData.actionIds?.map((actionId) => ({
							actionId,
						})),
					}),
				})
				.stores('mockRoleId', 'id');
		});
	});

	describe('Get roles', () => {
		const url = '/roles';

		itShouldThrowIfUnauthenticated('get', url);

		it('should get roles', () => {
			return pactum
				.spec()
				.get(url)
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectJsonLength('.', gte(1));
		});
	});

	describe('Get role by id', () => {
		const url = '/roles/{id}';
		const mockData = { ...mockCreateRoleData };

		itShouldThrowIfUnauthenticated('get', url);

		it('should get mock role', () => {
			return pactum
				.spec()
				.get(url)
				.withPathParams('id', '$S{mockRoleId}')
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectJsonLike({
					id: '$S{mockRoleId}',
					name: mockData.name,
					...(mockData.actionIds && {
						roleActions: mockData.actionIds?.map((actionId) => ({
							actionId,
						})),
					}),
				});
		});
	});

	describe('Edit role by id', () => {
		const url = '/roles/{id}';
		const mockData = { ...mockUpdateRoleData };

		itShouldThrowIfUnauthenticated('patch', url);

		it('should update mock role', () => {
			return pactum
				.spec()
				.patch(url)
				.withPathParams('id', '$S{mockRoleId}')
				.withBearerToken('$S{accessToken}')
				.withBody(mockData)
				.expectStatus(HttpStatus.OK)
				.expectJsonLike({
					id: '$S{mockRoleId}',
					name: mockData.name,
					...(mockData.actionIds && {
						roleActions: mockData.actionIds?.map((actionId) => ({
							actionId,
						})),
					}),
				});
		});
	});

	describe('Delete role by id', () => {
		const url = '/roles/{id}';
		const mockData = { ...mockUpdateRoleData };

		itShouldThrowIfUnauthenticated('delete', url);

		it('should delete mock role', () => {
			return pactum
				.spec()
				.delete(url)
				.withPathParams('id', '$S{mockRoleId}')
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectJsonLike({
					id: '$S{mockRoleId}',
					name: mockData.name,
					...(mockData.actionIds && {
						roleActions: mockData.actionIds?.map((actionId) => ({
							actionId,
						})),
					}),
				});
		});
	});
});
