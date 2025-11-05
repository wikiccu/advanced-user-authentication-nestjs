import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(2, { message: 'Role name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

