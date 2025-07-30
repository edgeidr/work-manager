export interface SendEmailInput {
	recipients: string[];
	subject: string;
	template: string;
	context?: Record<string, any>;
}
