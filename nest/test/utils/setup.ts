import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as pactum from 'pactum';
import * as cookieParser from 'cookie-parser';

let app: INestApplication;
let prisma: PrismaService;

export const setupApp = async () => {
	const moduleRef = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleRef.createNestApplication();
	app.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	await app.init();
	await app.listen(0);

	const server = app.getHttpServer();
	const address = server.address();
	const port = typeof address === 'string' ? 3001 : address.port;

	pactum.request.setBaseUrl(`http://localhost:${port}`);
	prisma = app.get(PrismaService);
};

export const teardownApp = async () => {
	await app.close();
};

export { app, prisma };
