import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { UsersService } from '../users/users.service';
import { SendOtpInput } from './types/send-otp.input';
import { CreateOtpInput } from './types/create-otp.input';
import { OtpExpiry } from './types/otp-expiry.type';
import { VerifyOtpInput } from './types/verify-otp.input';
import { OtpInput } from './types/otp.input';

@Injectable()
export class OtpsService {
	private readonly MAX_ATTEMPTS: number;

	constructor(
		private prisma: PrismaService,
		private config: ConfigService,
		private usersService: UsersService,
	) {
		this.MAX_ATTEMPTS = config.get<number>('MAX_OTP_ATTEMPTS', 3);
	}

	async create(input: CreateOtpInput): Promise<OtpExpiry> {
		const duration = this.config.get('OTP_DURATION_IN_MINUTES', 300);
		const totalDuration = duration * 1000 * 60;
		const expiry = new Date(Date.now() + totalDuration);
		const code = this.generate(6);
		const otp = await this.prisma.otp.create({
			data: {
				code,
				type: input.type,
				userId: input.userId,
				expiresAt: expiry,
			},
			select: {
				expiresAt: true,
			},
		});

		return otp;
	}

	async send(input: SendOtpInput): Promise<OtpExpiry> {
		const user = await this.usersService.findOneByEmail(
			input.email,
			new NotFoundException('messages.emailNotFound'),
		);

		const code = await this.create({ userId: user.id, type: input.type });

		return code;
	}

	async verify(input: VerifyOtpInput): Promise<boolean> {
		const user = await this.usersService.findOneByEmail(input.email, new BadRequestException('messages.tryAgain'));

		await this.validateAttemptAvailability({ userId: user.id, type: input.type });

		const otp = await this.prisma.otp.findFirst({
			where: {
				userId: user.id,
				code: input.code,
				type: input.type,
				used: false,
				expiresAt: { gt: new Date() },
			},
		});

		if (!otp) {
			await this.incrementAttempts({ userId: user.id, type: input.type });
			throw new BadRequestException('messages.invalidOtp');
		}

		await this.markAsUsed(otp.id);
		await this.resetAttempt({ userId: user.id, type: input.type });

		return true;
	}

	private async createAttempt(input: OtpInput): Promise<void> {
		await this.prisma.otpAttempt.create({
			data: {
				userId: input.userId,
				type: input.type,
				attempts: 1,
				lastAttemptAt: new Date(),
			},
		});
	}

	private async incrementAttempts(input: OtpInput): Promise<void> {
		const now = new Date();

		const otpAttempt = await this.prisma.otpAttempt.findUnique({
			where: {
				userId_type: {
					userId: input.userId,
					type: input.type,
				},
			},
		});

		if (!otpAttempt) {
			await this.createAttempt({ userId: input.userId, type: input.type });
			return;
		}

		if (otpAttempt.attempts >= this.MAX_ATTEMPTS - 1) {
			await this.lockAttempts({ userId: input.userId, type: input.type });
			return;
		}

		await this.prisma.otpAttempt.update({
			where: {
				userId_type: {
					userId: input.userId,
					type: input.type,
				},
			},
			data: {
				attempts: { increment: 1 },
				lastAttemptAt: now,
			},
		});
	}

	private async lockAttempts(input: OtpInput, exception?: HttpException): Promise<never> {
		const now = new Date();
		const OTP_LOCK_DURATION_IN_MINUTES = this.config.get('OTP_LOCK_DURATION_IN_MINUTES', 15);
		const totalOtpLockDuration = OTP_LOCK_DURATION_IN_MINUTES * 60 * 1000;
		const lockedUntil = new Date(now.getTime() + totalOtpLockDuration);

		await this.prisma.otpAttempt.update({
			where: {
				userId_type: {
					userId: input.userId,
					type: input.type,
				},
			},
			data: {
				attempts: { increment: 1 },
				lastAttemptAt: now,
				lockedUntil,
			},
		});

		throw exception ?? new BadRequestException('messages.maxOtpAttempts');
	}

	private async markAsUsed(id: number): Promise<void> {
		await this.prisma.otp.update({
			where: { id },
			data: {
				used: true,
			},
		});
	}

	private async resetAttempt(input: OtpInput): Promise<void> {
		await this.prisma.otpAttempt.update({
			where: {
				userId_type: {
					userId: input.userId,
					type: input.type,
				},
			},
			data: { attempts: 0 },
		});
	}

	private async validateAttemptAvailability(input: OtpInput, exception?: HttpException): Promise<void> {
		const otpAttempt = await this.prisma.otpAttempt.findUnique({
			where: {
				userId_type: {
					userId: input.userId,
					type: input.type,
				},
			},
		});

		if (
			otpAttempt &&
			otpAttempt.attempts >= this.MAX_ATTEMPTS &&
			otpAttempt.lockedUntil &&
			otpAttempt.lockedUntil > new Date()
		) {
			throw exception ?? new BadRequestException('messages.maxOtpAttempts');
		}
	}

	private generate(length: number = 6): string {
		return Array.from({ length }, () => randomInt(0, 10)).join('');
	}
}
