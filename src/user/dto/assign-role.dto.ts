import { IsString, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ 
    example: ['clx123abc', 'clx456def'], 
    description: 'Array of role IDs to assign',
    type: [String],
    minItems: 1
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role ID is required' })
  @IsString({ each: true })
  roleIds: string[];
}

