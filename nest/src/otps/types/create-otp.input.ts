import { OtpType } from '@prisma/client';

export interface CreateOtpInput {
	userId: number;
	type: OtpType;
}
