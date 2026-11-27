import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { buscarPorId, eliminarPorId } from '../comun/registros';
import { CreateFuncionDto } from './dto/create-funcion.dto';
import { UpdateFuncionDto } from './dto/update-funcion.dto';
import { Funcion } from './funcion.entity';
import { Sala } from '../salas/sala.entity';
import { Pelicula } from '../peliculas/pelicula.entity';
import { Boleto } from '../boletos/boleto.entity';

@Injectable()
export class FuncionesService {
  constructor(@InjectRepository(Funcion) private readonly repo: Repository<Funcion>) {}

  listar() {
    return this.repo.find({ order: { fechaHora: 'ASC', idFuncion: 'ASC' }, relations: { sala: true, pelicula: true } });
  }

  detalle(id: number) {
    return buscarPorId(this.repo, id, { relations: { sala: true, pelicula: true, boletos: true } });
  }

  crear(dto: CreateFuncionDto) {
    return this.repo.manager.transaction(async (em) => {
      await buscarPorId(em.getRepository(Sala), dto.idSala, { lock: { mode: 'pessimistic_read' } });
      await buscarPorId(em.getRepository(Pelicula), dto.idPelicula, { lock: { mode: 'pessimistic_read' } });
      const repo = em.getRepository(Funcion);
      return repo.save(repo.create({ ...dto, fechaHora: new Date(dto.fechaHora) }));
    });
  }

  actualizar(id: number, dto: UpdateFuncionDto) {
    return this.repo.manager.transaction(async (em) => {
      const repo = em.getRepository(Funcion);
      const funcion = await buscarPorId(repo, id, { lock: { mode: 'pessimistic_write' } });
      if (dto.idSala !== undefined) {
        const sala = await buscarPorId(em.getRepository(Sala), dto.idSala, { lock: { mode: 'pessimistic_read' } });
        const fueraDeRango = await em.getRepository(Boleto).existsBy({
          idFuncion: id, numeroAsiento: MoreThan(sala.capacidad),
        });
        if (fueraDeRango) throw new BadRequestException('La nueva sala deja fuera un asiento ya vendido');
        funcion.idSala = sala.idSala;
      }
      if (dto.idPelicula !== undefined) {
        await buscarPorId(em.getRepository(Pelicula), dto.idPelicula, { lock: { mode: 'pessimistic_read' } });
        funcion.idPelicula = dto.idPelicula;
      }
      if (dto.fechaHora !== undefined) funcion.fechaHora = new Date(dto.fechaHora);
      if (dto.precio !== undefined) funcion.precio = dto.precio;
      return repo.save(funcion);
    });
  }

  eliminar(id: number) {
    return eliminarPorId(this.repo, id);
  }
}
