import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
	imports: [RolesModule],
})
export class UsersModule {}
