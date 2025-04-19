import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';

describe('App e2e', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
			}),
		);

		await app.init();
		await app.listen(3001);

		prisma = app.get(PrismaService);

		await prisma.cleanDb();
	});

	afterAll(() => {
		app.close();
	});

	describe('Auth', () => {
		describe('Signup', () => {
			it.todo('should signup');
		});
		describe('Signin', () => {
			it.todo('should signin');
		});
	});

	describe('User', () => {
		describe('Get me', () => {});
		describe('Edit user', () => {});
	});

	describe('Role', () => {
		describe('Get roles', () => {});
		describe('Create role', () => {});
		describe('Get role by id', () => {});
		describe('Edit role', () => {});
		describe('Delete role', () => {});
	});

	describe('Action', () => {
		describe('Get actions', () => {});
		describe('Create action', () => {});
		describe('Get action by id', () => {});
		describe('Edit action', () => {});
		describe('Delete action', () => {});
	});
});
