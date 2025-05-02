import * as pactum from 'pactum';
import { setupApp, teardownApp } from './utils/setup';
import { itShouldThrowIfUnauthenticated, signInAsSuperuser } from './utils/shared-auth-test';
import { HttpStatus } from '@nestjs/common';
import { gte } from 'pactum-matchers';

describe('Actions E2E', () => {
	beforeAll(setupApp);
	afterAll(teardownApp);

	const mockCreateActionData = {
		name: 'mock:create',
		ignoreField: 'IGNORE', // should be ignored by DTO
	};

	const mockUpdateActionData = {
		name: 'mock:update',
		ignoreField: 'IGNORE', // should be ignored by DTO
	};

	signInAsSuperuser();

	describe('Get actions', () => {
		const url = '/actions';

		itShouldThrowIfUnauthenticated('get', url);

		it('should get actions', () => {
			return pactum
				.spec()
				.get(url)
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectJsonLength('.', gte(1));
		});
	});

	describe('Create action', () => {
		const url = '/actions';
		const mockData = { ...mockCreateActionData };

		itShouldThrowIfUnauthenticated('post', url);

		it('should throw if name is empty', () => {
			const { name, ...mockActionData } = mockData;

			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockActionData)
				.expectStatus(HttpStatus.BAD_REQUEST);
		});

		it('should create mock action', () => {
			return pactum
				.spec()
				.post(url)
				.withBearerToken('$S{accessToken}')
				.withBody(mockData)
				.expectStatus(HttpStatus.CREATED)
				.expectBodyContains('id')
				.expectJsonLike({
					name: mockData.name,
				})
				.stores('mockActionId', 'id');
		});
	});

	describe('Get action by id', () => {
		const url = '/actions/{id}';
		const mockData = { ...mockCreateActionData };

		itShouldThrowIfUnauthenticated('get', url);

		it('should get mock action', () => {
			return pactum
				.spec()
				.get(url)
				.withPathParams('id', '$S{mockActionId}')
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectBodyContains('id')
				.expectJsonLike({
					name: mockData.name,
				});
		});
	});

	describe('Edit action', () => {
		const url = '/actions/{id}';
		const mockData = { ...mockUpdateActionData };

		itShouldThrowIfUnauthenticated('patch', url);

		it('should update mock action', () => {
			return pactum
				.spec()
				.patch(url)
				.withPathParams('id', '$S{mockActionId}')
				.withBearerToken('$S{accessToken}')
				.withBody(mockData)
				.expectStatus(HttpStatus.OK)
				.expectBodyContains('id')
				.expectJsonLike({
					name: mockData.name,
				});
		});
	});

	describe('Delete action', () => {
		const url = '/actions/{id}';
		const mockData = { ...mockUpdateActionData };

		itShouldThrowIfUnauthenticated('delete', url);

		it('should delete mock action', () => {
			return pactum
				.spec()
				.delete(url)
				.withPathParams('id', '$S{mockActionId}')
				.withBearerToken('$S{accessToken}')
				.expectStatus(HttpStatus.OK)
				.expectBodyContains('id')
				.expectJsonLike({
					name: mockData.name,
				});
		});
	});
});
