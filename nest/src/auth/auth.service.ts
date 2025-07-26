import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { SignUpInput } from './types/sign-up.input';
import { SignInInput } from './types/sign-in.input';
import { ResetPasswordInput } from './types/reset-password.input';
import { RotateRefreshTokenInput } from './types/rotate-refresh-token.input';
import { SessionType } from '../tokens/types/session.type';
import { User } from '../users/types/user.type';

@Injectable()
export class AuthService {
	constructor(
		private tokensService: TokensService,
		private usersService: UsersService,
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
}
