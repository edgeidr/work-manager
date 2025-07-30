import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailInput } from './inputs/send-email.input';

@Injectable()
export class MailService {
	constructor(private readonly configService: ConfigService) {}

	mailTransport() {
		const transporter = nodemailer.createTransport({
			host: this.configService.get<string>('MAIL_HOST'),
			port: this.configService.get<number>('MAIL_PORT'),
			secure: false,
			auth: {
				user: this.configService.get<string>('MAIL_USER'),
				pass: this.configService.get<string>('MAIL_PASSWORD'),
			},
		});

		return transporter;
	}

	async sendEmail(input: SendEmailInput) {
		const transport = this.mailTransport();

		const options: nodemailer.SendMailOptions = {
			from: this.configService.get<string>('MAIL_SENDER'),
			to: input.recipients,
			subject: input.subject,
			html: input.html,
		};

		try {
			await transport.sendMail(options);
		} catch (error) {
			throw new InternalServerErrorException('messages.emailFailed');
		}
	}
}
