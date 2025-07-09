import { Token } from './token.type';

export interface SessionType {
	deviceId: string;
	accessToken: Token;
	refreshToken: Token;
}
