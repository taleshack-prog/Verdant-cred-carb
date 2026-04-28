import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('E-mail ja cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({ email: dto.email, passwordHash, fullName: dto.fullName, walletAddress: dto.walletAddress ?? null });
    await this.userRepo.save(user);
    this.logger.log(`Novo usuario: ${user.email}`);
    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Credenciais invalidas');
    if (!await bcrypt.compare(dto.password, user.passwordHash)) throw new UnauthorizedException('Credenciais invalidas');
    this.logger.log(`Login: ${user.email}`);
    return this.buildResponse(user);
  }

  private buildResponse(user: UserEntity) {
    return {
      accessToken: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }),
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }

  async findById(id: string) { return this.userRepo.findOne({ where: { id } }); }
}
