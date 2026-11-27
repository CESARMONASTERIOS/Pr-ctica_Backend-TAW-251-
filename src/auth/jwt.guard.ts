import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

const RUTA_PUBLICA = 'cine:ruta-publica';
export const Publico = () => SetMetadata(RUTA_PUBLICA, true);

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService) {}

  async canActivate(contexto: ExecutionContext) {
    const req = contexto.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) ||
        this.reflector.getAllAndOverride(RUTA_PUBLICA, [contexto.getHandler(), contexto.getClass()])) {
      return true;
    }
    const token = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? '')?.[1];
    if (token) {
      try {
        await this.jwt.verifyAsync(token, { algorithms: ['HS256'] });
        return true;
      } catch {
        throw new UnauthorizedException('El token es inválido o ha vencido');
      }
    }
    throw new UnauthorizedException('Se requiere un token Bearer del personal');
  }
}
