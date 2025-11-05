import { IsString, IsArray, ArrayMinSize } from 'class-validator';

export class AssignPermissionDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one permission ID is required' })
  @IsString({ each: true })
  permissionIds: string[];
}

