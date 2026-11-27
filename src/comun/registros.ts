import { NotFoundException } from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { Auditable } from './auditable';

const nombres: Record<string, string> = {
  sala: 'La sala', genero: 'El género', pelicula: 'La película',
  funcion: 'La función', cliente: 'El cliente', boleto: 'El boleto',
};

function clave<T extends Auditable>(repo: Repository<T>, id: number) {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) throw inexistente(repo, id);
  return { [repo.metadata.primaryColumns[0].propertyName]: id } as FindOptionsWhere<T>;
}

function inexistente<T extends Auditable>(repo: Repository<T>, id: number) {
  return new NotFoundException(`${nombres[repo.metadata.tableName]} con id ${id} no existe`);
}

export async function buscarPorId<T extends Auditable>(
  repo: Repository<T>, id: number, opciones: Omit<FindOneOptions<T>, 'where'> = {},
): Promise<T> {
  const fila = await repo.findOne({ ...opciones, where: clave(repo, id) });
  if (!fila) throw inexistente(repo, id);
  return fila;
}

export async function eliminarPorId<T extends Auditable>(repo: Repository<T>, id: number) {
  const filtro = { ...clave(repo, id), eliminadoEn: IsNull() } as FindOptionsWhere<T>;
  const resultado = await repo.softDelete(filtro);
  if (!resultado.affected) throw inexistente(repo, id);
  return { mensaje: `${nombres[repo.metadata.tableName]} con id ${id} se dio de baja` };
}
