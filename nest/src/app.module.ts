import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ActionsModule } from './actions/actions.module';
import { OtpsModule } from './otps/otps.module';
import { TokensModule } from './tokens/tokens.module';
import { MailModule } from './mail/mail.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		AuthModule,
		PrismaModule,
		UsersModule,
		RolesModule,
		ActionsModule,
		OtpsModule,
		TokensModule,
		MailModule,
	],
})
export class AppModule {}
