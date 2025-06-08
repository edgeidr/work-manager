import { Module } from '@nestjs/common';
import { OtpsService } from './otps.service';
import { OtpsController } from './otps.controller';
import { UsersModule } from '../users/users.module';

@Module({
	providers: [OtpsService],
	exports: [OtpsService],
	controllers: [OtpsController],
	imports: [UsersModule],
})
export class OtpsModule {}
