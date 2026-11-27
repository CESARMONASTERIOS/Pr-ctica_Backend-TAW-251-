import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sala } from './sala.entity';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sala])],
  controllers: [SalasController],
  providers: [SalasService],
})
export class SalasModule {}
