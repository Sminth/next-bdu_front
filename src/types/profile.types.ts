import { Permission } from "./permission.types";

export interface ProfilePermission {
  permissionId: string;
  permission: Permission;
}

export interface Profile {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: ProfilePermission[];
  _count?: { users: number };
}

export interface CreateProfilePayload {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateProfilePayload {
  name?: string;
  description?: string;
  permissionIds?: string[];
}
