import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { SignUpInput } from './inputs/sign-up.input';
import { SignInInput } from './inputs/sign-in.input';
import { ResetPasswordInput } from './inputs/reset-password.input';
import { RotateRefreshTokenInput } from './inputs/rotate-refresh-token.input';
import { SessionType } from '../tokens/types/session.type';
import { User } from '../users/types/user.type';
import { OtpsService } from '../otps/otps.service';
import { OtpType } from '@prisma/client';

@Injectable()
export class AuthService {
	constructor(
		private tokensService: TokensService,
		private usersService: UsersService,
		private readonly otpsService: OtpsService,
	) {}

	async signUp(input: SignUpInput): Promise<User> {
		const user = await this.usersService.createDefaultUser(
			{
				email: input.email,
				password: input.password,
				firstName: input.firstName,
				lastName: input.lastName,
			},
			new BadRequestException([
				{
					field: 'email',
					error: ['validation.emailAlreadyExists'],
				},
			]),
		);

		return user;
	}

	async signIn(input: SignInInput): Promise<{ user: User; session: SessionType }> {
		const user = await this.usersService.validateUserCredentials(
			{
				email: input.email,
				password: input.password,
			},
			new UnauthorizedException('messages.invalidCredentials'),
		);
		const session = await this.tokensService.createSession({
			userId: user.id,
			email: input.email,
			staySignedIn: input.staySignedIn,
		});

		return { session, user };
	}

	async signOut(deviceId: string): Promise<void> {
		await this.tokensService.removeSession(deviceId);
	}

	async resetPassword(input: ResetPasswordInput): Promise<void> {
		const { userId } = await this.tokensService.validatePasswordResetToken(
			input.token,
			new BadRequestException('messages.tryAgain'),
		);

		await this.usersService.updatePassword(
			{
				password: input.password,
				userId,
			},
			new BadRequestException('messages.tryAgain'),
		);

		await this.tokensService.removePasswordResetTokensForUser(userId);
	}

	async rotateRefreshToken(input: RotateRefreshTokenInput): Promise<SessionType> {
		const session = await this.tokensService.updateSession(
			{
				deviceId: input.deviceId,
				refreshToken: input.oldRefreshToken,
				staySignedIn: input.staySignedIn,
			},
			new UnauthorizedException(),
		);

		return session;
	}

	async forgotPassword(email: string) {
		return this.otpsService.send({
			subject: 'Reset Your Password - OTP Verification',
			title: 'Forgot your password?',
			email,
			type: OtpType.FORGOT_PASSWORD,
		});
	}
}
