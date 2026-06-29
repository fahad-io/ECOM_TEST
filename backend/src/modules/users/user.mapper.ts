import { Role } from '../../common/enums/role.enum';
import { UserDocument } from './schemas/user.schema';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarPath: string | null;
}

/** The public shape of a user — never includes the password hash. */
export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user.id as string,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarPath: user.avatarPath ?? null,
  };
}
