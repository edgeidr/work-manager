import { Injectable } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendOtpEmailInput } from './inputs/send-otp-email.input';

@Injectable()
export class MailTemplateService {
	constructor(private readonly mailService: MailService) {}

	async sendOtp(input: SendOtpEmailInput) {
		await this.mailService.sendEmail({
			subject: 'OTP',
			recipients: input.recipients,
			html: 'Hi',
			context: {
				code: input.code,
			},
		});
	}
}
