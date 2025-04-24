import { PrismaClient } from '@prisma/client';
import { actions } from './seed-data/actions';
import { roles } from './seed-data/roles';
import { superadmin, admin } from './seed-data/users';
import { hash } from 'argon2';

const prisma = new PrismaClient();

const seedActions = async () => {
	return await prisma.action.createManyAndReturn({
		data: [...actions],
	});
};

const seedRoles = async () => {
	return await prisma.role.createManyAndReturn({
		data: [...roles],
	});
};

const seedRoleActions = async (roles, actions) => {
	const roleActions = roles.flatMap(({ id: roleId }) => {
		return actions.map(({ id: actionId }) => ({
			roleId: roleId,
			actionId: actionId,
		}));
	});

	await prisma.roleAction.createMany({
		data: [...roleActions],
	});
};

const createUser = async (userData, roleId?: number, userActions?) => {
	await prisma.user.create({
		data: {
			email: userData.email,
			password: await hash(userData.password),
			firstName: userData.firstName,
			lastName: userData.lastName,
			userRoles: {
				createMany: {
					data: roleId ? [{ roleId: roleId }] : [],
				},
			},
			userActions: {
				createMany: {
					data:
						userActions?.map(({ actionId, scope }) => ({
							actionId: actionId,
							scope: scope,
						})) || [],
				},
			},
		},
	});
};

async function main() {
	const createdActions = await seedActions();
	const createdRoles = await seedRoles();

	await seedRoleActions(createdRoles, createdActions);

	const superadminRoleId = createdRoles.find(({ name }) => name === 'Superadmin')?.id;
	const adminRoleId = createdRoles.find(({ name }) => name === 'Admin')?.id;

	await createUser(
		superadmin,
		superadminRoleId,
		createdActions.map(({ id }) => ({ actionId: id, scope: 'ANY' })),
	);
	await createUser(
		admin,
		adminRoleId,
		createdActions.map(({ id }) => ({ actionId: id, scope: 'ANY' })),
	);

	console.log('Seeding done');
}

main()
	.catch((e) => {
		console.log(e);
		process.exit(1);
	})
	.finally(() => {
		prisma.$disconnect();
	});
