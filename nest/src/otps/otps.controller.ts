import { Body, Controller, Post } from '@nestjs/common';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpsService } from './otps.service';
import { VerifyOtpInput } from './types/verify-otp.input';

@Controller('otps')
export class OtpsController {
	constructor(private otpsService: OtpsService) {}

	@Post('verify')
	verify(@Body() verifyOtpDto: VerifyOtpDto) {
		const payload: VerifyOtpInput = {
			email: verifyOtpDto.email,
			code: verifyOtpDto.code,
			type: verifyOtpDto.type
		}
		
		return this.otpsService.verify(payload);
	}
}
