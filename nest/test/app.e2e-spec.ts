import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SignUpDto } from '../src/auth/dto/sign-up.dto';
import { SignInDto } from '../src/auth/dto/sign-in.dto';

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

		pactum.request.setBaseUrl('http://localhost:3001');
	});

	afterAll(() => {
		app.close();
	});

	describe('Auth', () => {
		describe('Signup', () => {
			const url = '/auth/signup';
			const signUpDto: SignUpDto = {
				email: 'edge.idr@gmail.com',
				password: 'password',
				firstName: 'Ian',
				lastName: 'Del Rosario',
			};

			it('should throw if email is empty', () => {
				const { email, ...incompleteDto } = signUpDto;

				return pactum.spec().post(url).withBody(incompleteDto).expectStatus(400);
			});

			it('should throw if password is empty', () => {
				const { password, ...incompleteDto } = signUpDto;

				return pactum.spec().post(url).withBody(incompleteDto).expectStatus(400);
			});

			it('should throw if firstName is empty', () => {
				const { firstName, ...incompleteDto } = signUpDto;

				return pactum.spec().post(url).withBody(incompleteDto).expectStatus(400);
			});

			it('should throw if lastName is empty', () => {
				const { lastName, ...incompleteDto } = signUpDto;

				return pactum.spec().post(url).withBody(incompleteDto).expectStatus(400);
			});

			it('should throw if no body is provided', () => {
				return pactum.spec().post(url).expectStatus(400);
			});

			it('should signup', () => {
				const signUpDto: SignUpDto = {
					email: 'edge.idr@gmail.com',
					password: 'password',
					firstName: 'Ian',
					lastName: 'Del Rosario',
				};

				return pactum.spec().post(url).withBody(signUpDto).expectStatus(201);
			});
		});

		describe('Signin', () => {
			const url = '/auth/signin';
			const signInDto: SignInDto = {
				email: 'edge.idr@gmail.com',
				password: 'password',
			};

			it('should throw if email is empty', () => {
				const { email, ...incompleteDto } = signInDto;

				return pactum.spec().post(url).withBody(incompleteDto).expectStatus(400);
			});

			it('should throw if password is empty', () => {
				const { password, ...incompleteDto } = signInDto;

				return pactum.spec().post(url).withBody(incompleteDto).expectStatus(400);
			});

			it('should throw if no body is provided', () => {
				return pactum.spec().post(url).expectStatus(400);
			});

			it('should signin', () => {
				return pactum.spec().post(url).withBody(signInDto).expectStatus(201);
			});
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
