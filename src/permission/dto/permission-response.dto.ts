export class PermissionResponseDto {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(permission: any) {
    this.id = permission.id;
    this.name = permission.name;
    this.description = permission.description;
    this.resource = permission.resource;
    this.action = permission.action;
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
  }
}

