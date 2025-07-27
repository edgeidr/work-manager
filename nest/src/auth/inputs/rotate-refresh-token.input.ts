export interface RotateRefreshTokenInput {
	deviceId: string;
	oldRefreshToken: string;
	staySignedIn: boolean;
}
