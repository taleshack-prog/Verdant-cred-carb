import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'produtor@fazenda.com.br' })
  @IsEmail() email: string;

  @ApiProperty({ minLength: 8 })
  @IsString() @MinLength(8) password: string;

  @ApiProperty({ example: 'Joao da Silva' })
  @IsString() fullName: string;

  @ApiPropertyOptional({ example: '0xAbCd...' })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Endereco de carteira invalido' })
  walletAddress?: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
}
