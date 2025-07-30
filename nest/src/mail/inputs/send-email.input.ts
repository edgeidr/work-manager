export interface SendEmailInput {
	recipients: string[];
	subject: string;
	html: string;
	context?: Record<string, any>;
}
