import {
  Body,
  Controller,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { productImageMulterOptions } from '../../common/upload/product-image.multer';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar', productImageMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update your own profile (name, password, profile picture)',
  })
  updateMe(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.users.updateProfile(userId, dto, avatar?.filename);
  }
}
