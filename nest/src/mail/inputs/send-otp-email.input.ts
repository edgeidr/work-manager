import { SendEmailInput } from './send-email.input';

export interface SendOtpEmailInput {
	subject: string;
	title: string;
	recipients: SendEmailInput['recipients'];
	code: string;
}
