import { Otp } from '@prisma/client';

export type OtpExpiry = Pick<Otp, 'expiresAt'>;
