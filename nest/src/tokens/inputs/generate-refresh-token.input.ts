export interface GenerateRefreshTokenInput {
	userId: number;
	email: string;
	deviceId: string;
	staySignedIn: boolean;
}
