import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

const BCRYPT_ROUNDS = 10;

export interface AuthResult {
  accessToken: string;
  user: { id: string; name: string; email: string; role: Role };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResult> {
    if (await this.users.existsByEmail(dto.email)) {
      throw new ConflictException('Email is already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: Role.User, // role is never client-controlled; admins are seeded
    });
    return this.buildResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByEmailWithPassword(dto.email);
    // Same error whether the email is unknown or the password is wrong, so we
    // don't leak which accounts exist.
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildResult(user);
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toPublic(user);
  }

  private buildResult(user: UserDocument): AuthResult {
    const payload = {
      sub: user.id as string,
      email: user.email,
      role: user.role,
    };
    // Secret + expiry come from JwtModule.registerAsync.
    const accessToken = this.jwt.sign(payload);
    return { accessToken, user: this.toPublic(user) };
  }

  private toPublic(user: UserDocument) {
    return {
      id: user.id as string,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
