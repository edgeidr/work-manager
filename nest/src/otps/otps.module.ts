import { Module } from '@nestjs/common';
import { OtpsService } from './otps.service';
import { OtpsController } from './otps.controller';
import { UsersModule } from '../users/users.module';
import { TokensModule } from '../tokens/tokens.module';

@Module({
	providers: [OtpsService],
	exports: [OtpsService],
	controllers: [OtpsController],
	imports: [UsersModule, TokensModule],
})
export class OtpsModule {}
