import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const ejemplo = readFileSync('.env.example', 'utf8');
const contenido = ejemplo
  .replace('CAMBIAR_PASSWORD', randomBytes(18).toString('hex'))
  .replace('CAMBIAR_CLAVE', randomBytes(12).toString('hex'))
  .replace('CAMBIAR_SECRETO', randomBytes(32).toString('hex'));

try {
  writeFileSync('.env', contenido, { flag: 'wx', mode: 0o600 });
  console.log('Se creó .env con credenciales locales. Ya puedes iniciar PostgreSQL.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('El archivo .env ya existe. Se conserva tu configuración.');
}
