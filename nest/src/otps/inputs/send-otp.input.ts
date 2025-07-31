import { OtpType } from '@prisma/client';

export interface SendOtpInput {
	subject: string;
	title: string;
	email: string;
	type: OtpType;
}
