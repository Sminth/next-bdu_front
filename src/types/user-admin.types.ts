import { Direction } from "./direction.types";
import { Profile } from "./profile.types";

export interface UserAdmin {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  jobTitle: string | null;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  directionId: string | null;
  direction: Direction | null;
  profileId: string | null;
  profile: Profile | null;
}

export interface CreateUserByAdminPayload {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  directionId?: string;
  profileId?: string;
}

export interface UpdateUserByAdminPayload {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  directionId?: string;
  profileId?: string;
  isActive?: boolean;
}
