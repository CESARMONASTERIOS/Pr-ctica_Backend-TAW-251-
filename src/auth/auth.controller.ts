import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { Publico } from './jwt.guard';

@ApiTags('Autenticación')
@Publico()
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar personal del cine', description: 'Crea una cuenta para el personal. Envía la clave CLAVE_REGISTRO configurada en el archivo .env.' })
  @ApiHeader({ name: 'x-clave-registro', required: true, description: 'Clave de alta del personal' })
  @ApiBody({ type: RegistroDto, description: 'Nombre de usuario, correo y contraseña.' })
  @ApiCreatedResponse({ description: 'Usuario registrado', schema: { type: 'object', properties: {
    idUsuario: { type: 'integer' }, username: { type: 'string' }, email: { type: 'string' },
  } } })
  @ApiBadRequestResponse({ description: 'Datos inválidos o email ya registrado' })
  @ApiUnauthorizedResponse({ description: 'Falta la clave de registro o es incorrecta' })
  registrar(@Body() dto: RegistroDto, @Headers('x-clave-registro') clave?: string) {
    return this.auth.registrar(dto, clave);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Si los datos son correctos, recibirás un token que dura dos horas.' })
  @ApiBody({ type: LoginDto, description: 'Correo y contraseña de la cuenta.' })
  @ApiOkResponse({ description: 'Token para usar las operaciones protegidas', schema: { type: 'object', properties: { access_token: { type: 'string' } } } })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'Email o contraseña incorrectos' })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
}
