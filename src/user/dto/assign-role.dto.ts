import { IsString, IsArray, ArrayMinSize } from 'class-validator';

export class AssignRoleDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role ID is required' })
  @IsString({ each: true })
  roleIds: string[];
}

