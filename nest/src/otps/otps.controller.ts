import { Body, Controller, Post } from '@nestjs/common';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpsService } from './otps.service';

@Controller('otps')
export class OtpsController {
	constructor(private otpsService: OtpsService) {}

	@Post('verify')
	verify(@Body() verifyOtpDto: VerifyOtpDto) {
		return this.otpsService.verify(verifyOtpDto);
	}
}
