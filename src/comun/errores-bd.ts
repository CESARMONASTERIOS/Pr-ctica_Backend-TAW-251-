import { QueryFailedError } from 'typeorm';

export function violaUnicidad(error: unknown, indice: string): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const detalle = error.driverError as { code?: string; constraint?: string };
  return detalle.code === '23505' && detalle.constraint === indice;
}
