import { OtpType } from "@prisma/client";

export interface VerifyOtpInput {
	email: string;
	code: string;
	type: OtpType;
}