import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from 'class-validator';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const host = configService.get<string>('API_HOST', '0.0.0.0');
	const port = configService.get<number>('API_PORT', 3001);
	const corsAllowedOrigin = configService.get<string>('CORS_ALLOWED_ORIGIN', '');

	app.use(cookieParser());
	app.enableCors({ origin: corsAllowedOrigin, credentials: true });
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			exceptionFactory: (validationErrors: ValidationError[] = []) => {
				return new BadRequestException(
					validationErrors.map((error) => ({
						field: error.property,
						error: error.constraints ? Object.values(error.constraints) : '',
					})),
				);
			},
		}),
	);

	await app.listen(port, host);
}

bootstrap();
