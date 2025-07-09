import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { SignUpInput } from './types/sign-up.input';
import { User } from '../common/types/user.type';
import { SignInInput } from './types/sign-in.input';
import { ResetPasswordInput } from './types/reset-password.input';
import { RotateRefreshTokenInput } from './types/rotate-refresh-token.input';
import { SessionType } from '../tokens/types/session.type';

@Injectable()
export class AuthService {
	constructor(
		private tokensService: TokensService,
		private usersService: UsersService,
	) {}

	async signUp(input: SignUpInput): Promise<User> {
		const { email, password, firstName, lastName } = input;
		const user = await this.usersService.createDefaultUser(
			{ email, password, firstName, lastName },
			new BadRequestException([{ field: 'email', error: ['validation.emailAlreadyExists'] }]),
		);

		return user;
	}

	async signIn(input: SignInInput): Promise<{ user: User; session: SessionType }> {
		const { email, password, staySignedIn } = input;
		const user = await this.usersService.validateUserCredentials(
			{ email, password },
			new UnauthorizedException('messages.invalidCredentials'),
		);
		const session = await this.tokensService.createSession({ userId: user.id, email, staySignedIn });

		return {
			session,
			user,
		};
	}

	async signOut(deviceId: string): Promise<void> {
		await this.tokensService.removeSession(deviceId);
	}

	async resetPassword(input: ResetPasswordInput): Promise<void> {
		const { password, token } = input;
		const { userId } = await this.tokensService.validatePasswordResetToken(
			token,
			new BadRequestException('messages.tryAgain'),
		);

		await this.usersService.updatePassword({ password, userId }, new BadRequestException('messages.tryAgain'));
		await this.tokensService.removePasswordResetTokensForUser(userId);
	}

	async rotateRefreshToken(input: RotateRefreshTokenInput): Promise<SessionType> {
		const { deviceId, oldRefreshToken, staySignedIn } = input;
		const session = await this.tokensService.updateSession(
			{ deviceId, refreshToken: oldRefreshToken, staySignedIn },
			new UnauthorizedException(),
		);

		return session;
	}
}
