import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(2, { message: 'Permission name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(2, { message: 'Resource must be at least 2 characters long' })
  resource: string;

  @IsString()
  @MinLength(2, { message: 'Action must be at least 2 characters long' })
  action: string;
}

