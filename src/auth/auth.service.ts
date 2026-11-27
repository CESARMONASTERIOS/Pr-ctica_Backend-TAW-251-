import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, truncates } from 'bcryptjs';
import { timingSafeEqual, createHash } from 'node:crypto';
import { Repository } from 'typeorm';
import { violaUnicidad } from '../comun/errores-bd';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { Usuario } from './usuario.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
              private readonly jwt: JwtService) {}

  async registrar(dto: RegistroDto, clave: string | undefined) {
    const resumen = (texto: string) => createHash('sha256').update(texto).digest();
    if (!clave || !timingSafeEqual(resumen(clave), resumen(process.env.CLAVE_REGISTRO!))) {
      throw new UnauthorizedException('Se requiere una clave de registro del personal válida');
    }
    if (truncates(dto.password)) throw new BadRequestException('La contraseña supera los 72 bytes de bcrypt');
    const usuario = this.usuarios.create({
      username: dto.username.trim(), email: dto.email.toLowerCase(), password: await hash(dto.password, 12),
    });
    try {
      const { idUsuario, username, email } = await this.usuarios.save(usuario);
      return { idUsuario, username, email };
    } catch (error) {
      if (violaUnicidad(error, 'uq_usuario_email')) throw new BadRequestException('El email ya está registrado');
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarios.createQueryBuilder('u').addSelect('u.password')
      .where('u.email = :email', { email: dto.email.toLowerCase() }).getOne();
    if (!usuario || truncates(dto.password) || !(await compare(dto.password, usuario.password))) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    return { access_token: await this.jwt.signAsync({ sub: usuario.idUsuario }) };
  }
}
