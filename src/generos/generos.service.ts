import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { buscarPorId, eliminarPorId } from '../comun/registros';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { Genero } from './genero.entity';

@Injectable()
export class GenerosService {
  constructor(@InjectRepository(Genero) private readonly repo: Repository<Genero>) {}

  listar() {
    return this.repo.find({ order: { idGenero: 'ASC' } });
  }

  detalle(id: number) {
    return buscarPorId(this.repo, id, { relations: { peliculas: true } });
  }

  crear(dto: CreateGeneroDto) {
    return this.repo.save(this.repo.create(dto));
  }

  actualizar(id: number, dto: UpdateGeneroDto) {
    return this.repo.manager.transaction(async (em) => {
      const repo = em.getRepository(Genero);
      const registro = await buscarPorId(repo, id, { lock: { mode: 'pessimistic_write' } });
      return repo.save(repo.merge(registro, dto));
    });
  }

  eliminar(id: number) {
    return eliminarPorId(this.repo, id);
  }
}
