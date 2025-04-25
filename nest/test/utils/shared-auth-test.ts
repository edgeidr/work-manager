import { HttpStatus } from '@nestjs/common';
import * as pactum from 'pactum';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export const itShouldThrowIfUnauthenticated = (method: HttpMethod, url: string) => {
	it('should throw if unauthenticated', () => {
		return pactum.spec()[method](url).expectStatus(HttpStatus.UNAUTHORIZED);
	});
};
