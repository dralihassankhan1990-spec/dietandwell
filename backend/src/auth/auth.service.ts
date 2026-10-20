import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token (not hashed - JWT signature provides security)
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    // Remove password from response
    const { password: _, refreshToken: __, ...userResponse } = user;

    return {
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Deactivated accounts cannot log in
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token (not hashed - JWT signature provides security)
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    // Remove password from response
    const { password: _, refreshToken: __, ...userResponse} = user;

    return {
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    // Increment refresh token version to invalidate all existing refresh tokens
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = null;
      user.refreshTokenVersion += 1;
      await this.userRepository.save(user);
    }
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify and decode the refresh token to get token version
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshTokenSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify userId from token matches the provided userId
    if (payload.sub !== userId) {
      throw new UnauthorizedException('Token user mismatch');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    // Verify token version matches (prevents use of old tokens after logout)
    if (payload.tokenVersion !== user.refreshTokenVersion) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Verify the refresh token matches the stored one
    if (refreshToken !== user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);

    // Store new refresh token
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    return tokens;
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) throw new ConflictException('Email already in use');
      user.email = dto.email.toLowerCase();
    }
    if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.password) user.password = await bcrypt.hash(dto.password, await bcrypt.genSalt(10));

    const saved = await this.userRepository.save(user);
    const { password, refreshToken, ...safeUser } = saved;
    return safeUser;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tokenVersion: user.refreshTokenVersion,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d') as any,
    });

    // Include token version in refresh token to enable revocation
    const refreshPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tokenVersion: user.refreshTokenVersion,
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.refreshTokenSecret(),
      expiresIn: this.configService.get<string>(
        'REFRESH_TOKEN_EXPIRES_IN',
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      ) as any,
    });

    return { accessToken, refreshToken };
  }

  private refreshTokenSecret(): string {
    return this.configService.get<string>('REFRESH_TOKEN_SECRET')
      || this.configService.get<string>('JWT_SECRET')!;
  }
}
