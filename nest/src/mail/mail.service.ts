import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailInput } from './inputs/send-email.input';
import { join } from 'path';
import { promises } from 'fs';
import * as Handlebars from 'handlebars';
import { RenderTemplateInput } from './inputs/render-template.input';

@Injectable()
export class MailService {
	constructor(private readonly configService: ConfigService) {}

	private createTransporter() {
		const transporter = nodemailer.createTransport({
			host: this.configService.get<string>('MAIL_HOST'),
			port: this.configService.get<number>('MAIL_PORT'),
			secure: this.configService.get<number>('MAIL_PORT') === 465,
			auth: {
				user: this.configService.get<string>('MAIL_USER'),
				pass: this.configService.get<string>('MAIL_PASSWORD'),
			},
		});

		return transporter;
	}

	async sendEmail(input: SendEmailInput) {
		const transporter = this.createTransporter();
		const html = await this.renderTemplate({ template: input.template, context: input.context });

		const options: nodemailer.SendMailOptions = {
			from: this.configService.get<string>('MAIL_SENDER'),
			to: input.recipients,
			subject: input.subject,
			html: html,
		};

		try {
			await transporter.sendMail(options);
		} catch (error) {
			throw new InternalServerErrorException('messages.emailFailed');
		}
	}

	private async renderTemplate(input: RenderTemplateInput): Promise<string> {
		const templatePath = join(__dirname, 'templates', `${input.template}.hbs`);
		const templateSource = await promises.readFile(templatePath, 'utf8');
		const compiledTemplate = Handlebars.compile(templateSource);

		return compiledTemplate(input.context);
	}
}
