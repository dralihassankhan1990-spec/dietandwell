import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
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
      payload = await this.jwtService.verifyAsync(refreshToken);
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

  async validateUser(userId: string): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      expiresIn: '1d',
    });

    // Include token version in refresh token to enable revocation
    const refreshPayload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      tokenVersion: user.refreshTokenVersion,
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
