import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SignUpDto } from '../src/auth/dto/sign-up.dto';
import { SignInDto } from '../src/auth/dto/sign-in.dto';
import { CreateRoleDto } from '../src/roles/dto/create-role.dto';
import { UpdateRoleDto } from '../src/roles/dto/update-role.dto';
import { CreateActionDto } from '../src/actions/dto/create-action.dto';
import { UpdateActionDto } from '../src/actions/dto/update-action.dto';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';

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
				const { email, ...signUpData } = signUpDto;

				return pactum.spec().post(url).withBody(signUpData).expectStatus(400);
			});

			it('should throw if password is empty', () => {
				const { password, ...signUpData } = signUpDto;

				return pactum.spec().post(url).withBody(signUpData).expectStatus(400);
			});

			it('should throw if firstName is empty', () => {
				const { firstName, ...signUpData } = signUpDto;

				return pactum.spec().post(url).withBody(signUpData).expectStatus(400);
			});

			it('should throw if lastName is empty', () => {
				const { lastName, ...signUpData } = signUpDto;

				return pactum.spec().post(url).withBody(signUpData).expectStatus(400);
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
				const { email, ...signInData } = signInDto;

				return pactum.spec().post(url).withBody(signInData).expectStatus(400);
			});

			it('should throw if password is empty', () => {
				const { password, ...signInData } = signInDto;

				return pactum.spec().post(url).withBody(signInData).expectStatus(400);
			});

			it('should throw if no body is provided', () => {
				return pactum.spec().post(url).expectStatus(400);
			});

			it('should signin', () => {
				return pactum
					.spec()
					.post(url)
					.withBody(signInDto)
					.expectStatus(201)
					.stores('accessToken', 'accessToken');
			});
		});
	});

	describe('Role', () => {
		describe('Get roles', () => {
			const url = '/roles';

			it('should get roles', () => {
				return pactum.spec().get(url).withBearerToken('$S{accessToken}').expectStatus(200);
			});
		});

		describe('Create role', () => {
			const url = '/roles';

			it('should creale role Superadmin', () => {
				const createRoleDto: CreateRoleDto = {
					name: 'Super Admin',
				};

				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createRoleDto)
					.expectStatus(201)
					.stores('superadminId', 'id');
			});

			it('should creale role Admin', () => {
				const createRoleDto: CreateRoleDto = {
					name: 'Admin',
				};

				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createRoleDto)
					.expectStatus(201)
					.stores('adminId', 'id');
			});
		});

		describe('Get role by id', () => {
			const url = '/roles/{id}';

			it('should get role Super Admin', () => {
				return pactum
					.spec()
					.get(url)
					.withPathParams('id', '$S{superadminId}')
					.withBearerToken('$S{accessToken}')
					.expectStatus(200);
			});
		});

		describe('Edit role by id', () => {
			const url = '/roles/{id}';
			const updateRoleDto: UpdateRoleDto = {
				name: 'Superadmin',
			};

			it('should edit role Super Admin to Superadmin', () => {
				return pactum
					.spec()
					.patch(url)
					.withPathParams('id', '$S{superadminId}')
					.withBearerToken('$S{accessToken}')
					.withBody(updateRoleDto)
					.expectStatus(200);
			});
		});

		describe('Delete role by id', () => {
			const url = '/roles/{id}';

			it('should delete role Admin', () => {
				return pactum
					.spec()
					.delete(url)
					.withPathParams('id', '$S{adminId}')
					.withBearerToken('$S{accessToken}')
					.expectStatus(200);
			});
		});
	});

	describe('Action', () => {
		describe('Get actions', () => {
			const url = '/actions';

			it('should get actions', () => {
				return pactum.spec().get(url).withBearerToken('$S{accessToken}').expectStatus(200);
			});
		});

		describe('Create action', () => {
			const url = '/actions';

			it("should create action 'role:creates'", () => {
				const createActionDto: CreateActionDto = {
					name: 'role:creates',
				};

				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createActionDto)
					.expectStatus(201)
					.stores('roleCreateId', 'id');
			});

			it("should create action 'role:update'", () => {
				const createActionDto: CreateActionDto = {
					name: 'role:update',
				};

				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createActionDto)
					.expectStatus(201)
					.stores('roleUpdateId', 'id');
			});
		});

		describe('Get action by id', () => {
			const url = '/actions/{id}';

			it("should get action 'role:creates'", () => {
				return pactum
					.spec()
					.get(url)
					.withPathParams('id', '$S{roleCreateId}')
					.withBearerToken('$S{accessToken}')
					.expectStatus(200);
			});

			it("should get action 'role:update'", () => {
				return pactum
					.spec()
					.get(url)
					.withPathParams('id', '$S{roleUpdateId}')
					.withBearerToken('$S{accessToken}')
					.expectStatus(200);
			});
		});

		describe('Edit action', () => {
			const url = '/actions/{id}';
			const updateActionDto: UpdateActionDto = {
				name: 'role:create',
			};

			it("should update action 'role:creates' to 'role:create'", () => {
				return pactum
					.spec()
					.patch(url)
					.withPathParams('id', '$S{roleCreateId}')
					.withBearerToken('$S{accessToken}')
					.withBody(updateActionDto)
					.expectStatus(200);
			});
		});

		describe('Delete action', () => {
			const url = '/actions/{id}';

			it("should delete action 'role:update'", () => {
				return pactum
					.spec()
					.delete(url)
					.withPathParams('id', '$S{roleUpdateId}')
					.withBearerToken('$S{accessToken}')
					.expectStatus(200);
			});
		});
	});

	describe('User', () => {
		describe('Get me', () => {
			const url = '/users/me';

			it('should get current user', () => {
				return pactum.spec().get(url).withBearerToken('$S{accessToken}').expectStatus(200);
			});
		});

		describe('Get users', () => {
			const url = '/users';

			it('should get users', () => {
				return pactum.spec().get(url).withBearerToken('$S{accessToken}').expectStatus(200);
			});
		});

		describe('Create user', () => {
			const url = '/users';
			const createUserDto = {
				email: 'testsuperadmin@gmail.com',
				password: 'testpassword',
				firstName: 'Test',
				lastName: 'Super Admin',
				isActive: true,
				roleIds: ['$S{superadminId}'],
			};
			const createAnotherUserDto = {
				email: 'testsuperadmin2@gmail.com',
				password: 'testpassword',
				firstName: 'Test 2',
				lastName: 'Super Admin',
				isActive: true,
				roleIds: ['$S{superadminId}'],
			};

			it('should throw if email is empty', () => {
				const { email, ...createUserData } = createUserDto;

				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createUserData)
					.expectStatus(400);
			});

			it('should throw if password is empty', () => {
				const { password, ...createUserData } = createUserDto;

				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createUserData)
					.expectStatus(400);
			});

			it('should throw if firstName is empty', () => {
				const { firstName, ...createUserData } = createUserDto;

				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createUserData)
					.expectStatus(400);
			});

			it('should throw if lastName is empty', () => {
				const { lastName, ...createUserData } = createUserDto;

				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createUserData)
					.expectStatus(400);
			});

			it('should throw if isActive is empty', () => {
				const { isActive, ...createUserData } = createUserDto;

				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createUserData)
					.expectStatus(400);
			});

			it('should throw if no body is provided', () => {
				return pactum.spec().post(url).withBearerToken('$S{accessToken}').expectStatus(400);
			});

			it('should create user with Superadmin role', () => {
				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createUserDto)
					.expectStatus(201)
					.stores('testId', 'id');
			});

			it('should create another user with Superadmin role', () => {
				return pactum
					.spec()
					.post(url)
					.withBearerToken('$S{accessToken}')
					.withBody(createAnotherUserDto)
					.expectStatus(201)
					.stores('test2Id', 'id');
			});
		});

		describe('Get user by id', () => {
			const url = '/users/{id}';

			it("should get user 'Test Super Admin'", () => {
				return pactum
					.spec()
					.get(url)
					.withPathParams('id', '$S{testId}')
					.withBearerToken('$S{accessToken}')
					.expectStatus(200);
			});

			it("should get user 'Test 2 Super Admin'", () => {
				return pactum
					.spec()
					.get(url)
					.withPathParams('id', '$S{test2Id}')
					.withBearerToken('$S{accessToken}')
					.expectStatus(200);
			});
		});

		describe('Edit user', () => {
			const url = '/users/{id}';
			const updateUserDto: UpdateUserDto = {
				isActive: false,
			};

			it("should update isActive of user 'Test 2 Super Admin's' from 'true' to 'false'", () => {
				return pactum
					.spec()
					.patch(url)
					.withPathParams('id', '$S{test2Id}')
					.withBearerToken('$S{accessToken}')
					.withBody(updateUserDto)
					.expectStatus(200);
			});
		});

		describe('Delete user', () => {
			const url = '/users/{id}';

			it("should delete user 'Test 2 Super Admin'", () => {
				return pactum
					.spec()
					.delete(url)
					.withPathParams('id', '$S{test2Id}')
					.withBearerToken('$S{accessToken}')
					.expectStatus(200);
			});
		});
	});
});
