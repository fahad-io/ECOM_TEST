import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { toPublicImagePath } from '../../common/upload/product-image.multer';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PublicUser, toPublicUser } from './user.mapper';
import { UsersRepository } from './users.repository';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  /**
   * Updates the signed-in user's own profile: name, profile picture, and/or
   * password. A password change requires the correct current password.
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    avatarFilename?: string,
  ): Promise<PublicUser> {
    const data: {
      name?: string;
      passwordHash?: string;
      avatarPath?: string | null;
    } = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }
    if (avatarFilename) {
      data.avatarPath = toPublicImagePath(avatarFilename);
    }
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required to set a new one');
      }
      const user = await this.users.findByIdWithPassword(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!ok) {
        throw new BadRequestException('Current password is incorrect');
      }
      data.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    }

    if (Object.keys(data).length === 0) {
      // Nothing to change — return the current profile.
      const current = await this.users.findById(userId);
      if (!current) throw new NotFoundException('User not found');
      return toPublicUser(current);
    }

    const updated = await this.users.updateById(userId, data);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return toPublicUser(updated);
  }
}
