import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SalasModule } from './salas/salas.module';
import { GenerosModule } from './generos/generos.module';
import { PeliculasModule } from './peliculas/peliculas.module';
import { FuncionesModule } from './funciones/funciones.module';
import { ClientesModule } from './clientes/clientes.module';
import { BoletosModule } from './boletos/boletos.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: () => ({
      type: 'postgres', host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
      username: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA || 'public',
      autoLoadEntities: true, synchronize: process.env.DB_SYNC === 'true',
    }) }),
    AuthModule, SalasModule, GenerosModule, PeliculasModule, FuncionesModule, ClientesModule, BoletosModule,
  ],
})
export class AppModule {}
