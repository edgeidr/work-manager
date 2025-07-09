import { OtpType } from '@prisma/client';

export interface SendOtpInput {
	email: string;
	type: OtpType;
}
