import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buscarPorId, eliminarPorId } from '../comun/registros';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';
import { Sala } from './sala.entity';
import { Boleto } from '../boletos/boleto.entity';

@Injectable()
export class SalasService {
  constructor(@InjectRepository(Sala) private readonly repo: Repository<Sala>) {}

  listar() {
    return this.repo.find({ order: { idSala: 'ASC' } });
  }

  detalle(id: number) {
    return buscarPorId(this.repo, id, { relations: { funciones: true } });
  }

  crear(dto: CreateSalaDto) {
    return this.repo.save(this.repo.create(dto));
  }

  actualizar(id: number, dto: UpdateSalaDto) {
    return this.repo.manager.transaction(async (em) => {
      const repo = em.getRepository(Sala);
      const registro = await buscarPorId(repo, id, { lock: { mode: 'pessimistic_write' } });
      if (dto.capacidad !== undefined && dto.capacidad < registro.capacidad) {
        const superaCapacidad = await em.getRepository(Boleto).createQueryBuilder('b')
          .innerJoin('b.funcion', 'f')
          .where('f.idSala = :id', { id })
          .andWhere('b.numeroAsiento > :limite', { limite: dto.capacidad })
          .getExists();
        if (superaCapacidad) {
          throw new BadRequestException('La capacidad dejaría fuera un asiento vendido en esta sala');
        }
      }
      return repo.save(repo.merge(registro, dto));
    });
  }

  eliminar(id: number) {
    return eliminarPorId(this.repo, id);
  }
}
