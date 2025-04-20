import { IsNotEmpty, IsString } from 'class-validator';

export class CreateActionDto {
	@IsNotEmpty()
	@IsString()
	name: string;
}
