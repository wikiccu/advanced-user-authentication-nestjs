export class RoleResponseDto {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(role: any) {
    this.id = role.id;
    this.name = role.name;
    this.description = role.description;
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
  }
}

