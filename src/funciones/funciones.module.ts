import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Funcion } from './funcion.entity';
import { FuncionesController } from './funciones.controller';
import { FuncionesService } from './funciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Funcion])],
  controllers: [FuncionesController],
  providers: [FuncionesService],
})
export class FuncionesModule {}
