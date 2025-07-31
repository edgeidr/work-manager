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
	constructor(private readonly configService: ConfigService) {
		this.registerPartials();
	}

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
		const layoutPath = join(__dirname, 'templates/layouts/main.hbs');
		const templatePath = join(__dirname, 'templates', `${input.template}.hbs`);
		const globalStylePath = join(__dirname, 'templates/styles/global.css.hbs');
		const pageStylePath = join(__dirname, 'templates/styles/', `${input.template}.css.hbs`);

		const layoutSource = await promises.readFile(layoutPath, 'utf8');
		const templateSource = await promises.readFile(templatePath, 'utf8');

		const globalStyles = await this.readIfExists(globalStylePath);
		const pageStyles = await this.readIfExists(pageStylePath);
		const combinedStyles = `${globalStyles}\n${pageStyles}`.trim();

		const body = Handlebars.compile(templateSource)(input.context);
		const compiledLayout = Handlebars.compile(layoutSource);

		return compiledLayout({
			...input.context,
			body,
			styles: combinedStyles,
		});
	}

	private async registerPartials() {
		const partialsDir = join(__dirname, 'templates', 'partials');
		const files = await promises.readdir(partialsDir);

		await Promise.all(
			files.map(async (file) => {
				const filePath = join(partialsDir, file);
				const fileName = file.replace('.hbs', '');
				const fileContent = await promises.readFile(filePath, 'utf8');

				Handlebars.registerPartial(fileName, fileContent);
			}),
		);
	}

	private async readIfExists(path: string): Promise<string> {
		try {
			return await promises.readFile(path, 'utf8');
		} catch (err) {
			return ''; // If the CSS file doesn't exist, return empty string
		}
	}
}
