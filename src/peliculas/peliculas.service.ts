import { NotFoundException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { buscarPorId, eliminarPorId } from '../comun/registros';
import { CreatePeliculaDto } from './dto/create-pelicula.dto';
import { UpdatePeliculaDto } from './dto/update-pelicula.dto';
import { Pelicula } from './pelicula.entity';
import { Genero } from '../generos/genero.entity';

@Injectable()
export class PeliculasService {
  constructor(@InjectRepository(Pelicula) private readonly repo: Repository<Pelicula>) {}

  listar() {
    return this.repo.find({ order: { idPelicula: 'ASC' }, relations: { generos: true } });
  }

  detalle(id: number) {
    return buscarPorId(this.repo, id, { relations: { generos: true, funciones: true } });
  }

  private async buscarGeneros(em: EntityManager, ids: number[]) {
    if (!ids.length) return [];
    const generos = await em.getRepository(Genero).createQueryBuilder('genero')
      .where('genero.idGenero IN (:...ids)', { ids })
      .orderBy('genero.idGenero', 'ASC').setLock('pessimistic_read').getMany();
    const presentes = new Set(generos.map((g) => g.idGenero));
    const faltante = ids.find((id) => !presentes.has(id));
    if (faltante !== undefined) throw new NotFoundException(`El género con id ${faltante} no existe`);
    return generos;
  }

  crear({ idGeneros = [], ...datos }: CreatePeliculaDto) {
    return this.repo.manager.transaction(async (em) => {
      const generos = await this.buscarGeneros(em, idGeneros);
      const repo = em.getRepository(Pelicula);
      return repo.save(repo.create({ ...datos, generos }));
    });
  }

  actualizar(id: number, dto: UpdatePeliculaDto) {
    return this.repo.manager.transaction(async (em) => {
      const repo = em.getRepository(Pelicula);
      const pelicula = await buscarPorId(repo, id, { lock: { mode: 'pessimistic_write' } });
      return repo.save(repo.merge(pelicula, dto));
    });
  }

  asignar(id: number, ids: number[]) {
    return this.repo.manager.transaction(async (em) => {
      const repo = em.getRepository(Pelicula);
      await buscarPorId(repo, id, { lock: { mode: 'pessimistic_write' } });
      const generos = await this.buscarGeneros(em, ids);
      const pelicula = await buscarPorId(repo, id, { relations: { generos: true } });
      const actuales = new Set(pelicula.generos.map((g) => g.idGenero));
      const nuevos = generos.filter((g) => !actuales.has(g.idGenero));
      if (nuevos.length) await em.createQueryBuilder().relation(Pelicula, 'generos').of(id).add(nuevos);
      return buscarPorId(repo, id, { relations: { generos: true } });
    });
  }

  quitar(id: number, idGenero: number) {
    return this.repo.manager.transaction(async (em) => {
      const repo = em.getRepository(Pelicula);
      await buscarPorId(repo, id, { lock: { mode: 'pessimistic_write' } });
      await buscarPorId(em.getRepository(Genero), idGenero, { lock: { mode: 'pessimistic_read' } });
      await em.createQueryBuilder().relation(Pelicula, 'generos').of(id).remove(idGenero);
      return buscarPorId(repo, id, { relations: { generos: true } });
    });
  }

  eliminar(id: number) {
    return eliminarPorId(this.repo, id);
  }
}
