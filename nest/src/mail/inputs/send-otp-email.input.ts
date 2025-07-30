import { SendEmailInput } from './send-email.input';

export interface SendOtpEmailInput {
	recipients: SendEmailInput['recipients'];
	code: string;
}
