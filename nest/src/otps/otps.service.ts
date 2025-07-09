import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OtpType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UsersService } from '../users/users.service';
import { SendOtpInput } from './types/send-otp.input';
import { CreateOtpInput } from './types/create-otp.input';
import { OtpExpiry } from './types/otp-expiry.type';

@Injectable()
export class OtpsService {
	constructor(
		private prisma: PrismaService,
		private config: ConfigService,
		private usersService: UsersService,
	) {}

	async create(input: CreateOtpInput): Promise<OtpExpiry> {
		const { userId, type } = input;
		const duration = this.config.get('OTP_DURATION_IN_MINUTES', 300);
		const totalDuration = duration * 1000 * 60;
		const expiry = new Date(Date.now() + totalDuration);
		const code = this.generate(6);
		const otp = await this.prisma.otp.create({
			data: {
				code,
				type,
				userId,
				expiresAt: expiry,
			},
			select: {
				expiresAt: true,
			},
		});

		return otp;
	}

	async sendOtp(input: SendOtpInput) {
		const { email, type } = input;
		const user = await this.usersService.findOneByEmail(email, new NotFoundException('messages.emailNotFound'));
		const code = await this.create({ userId: user.id, type });

		return code;
	}

	async verify(verifyOtpDto: VerifyOtpDto) {
		const MAX_ATTEMPTS = 3;
		const { email, code, type } = verifyOtpDto;

		const user = await this.usersService.findOneByEmail(email);

		const otp = await this.prisma.otp.findFirst({
			where: {
				userId: user.id,
				code,
				type,
				used: false,
				expiresAt: { gt: new Date() },
			},
		});

		if (!otp) {
			await this.incrementAttempts(user.id, type);
			throw new BadRequestException('messages.invalidOtp');
		}

		if (otp.attempts >= MAX_ATTEMPTS) {
			await this.incrementAttempts(user.id, type);
			throw new ForbiddenException('messages.maxOtpAttempts');
		}

		this.markAsUsed(otp.id);

		return true;
	}

	private async incrementAttempts(userId: number, type: OtpType) {
		await this.prisma.otp.updateMany({
			where: {
				userId,
				type,
				used: false,
			},
			data: {
				attempts: { increment: 1 },
			},
		});
	}

	private async markAsUsed(id: number) {
		await this.prisma.otp.update({
			where: { id },
			data: {
				used: true,
			},
		});
	}

	private generate(length: number = 6): string {
		return Array.from({ length }, () => randomInt(0, 10)).join('');
	}
}
