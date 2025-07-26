import { OtpType } from '@prisma/client';

export interface OtpInput {
	userId: number;
	type: OtpType;
}
