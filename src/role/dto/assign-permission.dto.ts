import { IsString, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({ 
    example: ['clx123abc', 'clx456def'], 
    description: 'Array of permission IDs to assign',
    type: [String],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one permission ID is required' })
  @IsString({ each: true })
  permissionIds: string[];
}

