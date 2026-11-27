import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import pg from 'pg';
import { compare } from 'bcryptjs';
import { iniciar } from '../dist/main.js';

test('Sistema de cine con PostgreSQL', async (t) => {
  const esquema = 'cine_prueba_' + randomUUID().replaceAll('-', '');
  const db = new pg.Client({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  });
  await db.connect();
  let app;
  t.after(async () => {
    try {
      if (app) await app.close();
      await db.query(`DROP SCHEMA IF EXISTS "${esquema}" CASCADE`);
    } finally {
      await db.end();
    }
  });
  await db.query(`CREATE SCHEMA "${esquema}"`);
  Object.assign(process.env, { PORT: '0', DB_SCHEMA: esquema, DB_SYNC: 'true' });
  app = await iniciar();
  const base = 'http://127.0.0.1:' + app.getHttpServer().address().port;
  let token;
  async function pedir(metodo, ruta, datos, headers = {}) {
    const respuesta = await fetch(base + ruta, {
      method: metodo, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...headers },
      body: datos === undefined ? undefined : JSON.stringify(datos),
    });
    return { estado: respuesta.status, dato: await respuesta.json() };
  }
  async function esperar(metodo, ruta, datos, estado, headers) {
    const r = await pedir(metodo, ruta, datos, headers);
    assert.equal(r.estado, estado, metodo + ' ' + ruta + ' → ' + JSON.stringify(r.dato));
    return r.dato;
  }
  const get = (ruta) => esperar('GET', ruta, undefined, 200);
  const post = (ruta, datos) => esperar('POST', ruta, datos, 201);
  const patch = (ruta, datos) => esperar('PATCH', ruta, datos, 200);
  const baja = (ruta) => esperar('DELETE', ruta, undefined, 200);
  const modulos = ['salas', 'generos', 'peliculas', 'funciones', 'clientes', 'boletos'];
  const usuario = { username: 'taquilla', email: 'personal@example.com', password: 'FuncionDeNoche7' };
  const invitacion = { 'x-clave-registro': process.env.CLAVE_REGISTRO };
  const cine = {};

  await t.test('Scalar describe las 34 operaciones y los cuerpos de entrada', async () => {
    const documento = await get('/openapi.json');
    const operaciones = Object.values(documento.paths).flatMap(Object.values);
    assert.equal(operaciones.length, 34);
    assert.equal(new Set(operaciones.flatMap((op) => op.tags)).size, 7);
    for (const [ruta, metodos] of Object.entries(documento.paths)) {
      for (const [metodo, op] of Object.entries(metodos)) {
        assert.ok(op.description && op.summary);
        assert.ok(op.responses['200'] || op.responses['201']);
        if (['post', 'patch'].includes(metodo)) assert.ok(op.requestBody?.description);
        if (metodo !== 'get' && !ruta.startsWith('/auth/')) assert.ok(op.security.some((s) => 'bearer' in s));
      }
    }
    const html = await fetch(base + '/docs');
    assert.equal(html.status, 200);
    assert.match(await html.text(), /Scalar.createApiReference/);
    assert.equal((await fetch(base + '/docs/scalar.js', { method: 'HEAD' })).status, 200);
  });

  await t.test('GET públicos, escrituras protegidas, alta del personal, bcrypt y JWT', async () => {
    for (const modulo of modulos) {
      assert.deepEqual(await get('/' + modulo), []);
      await esperar('POST', '/' + modulo, {}, 401);
      await esperar('PATCH', '/' + modulo + '/1', {}, 401);
      await esperar('DELETE', '/' + modulo + '/1', undefined, 401);
    }
    await esperar('POST', '/salas', {}, 401, { Authorization: 'Bearer invalido' });
    await esperar('POST', '/auth/register', usuario, 401);
    const alta = await esperar('POST', '/auth/register', usuario, 201, invitacion);
    assert.equal(alta.password, undefined);
    const guardada = (await db.query(`SELECT password FROM "${esquema}".usuario`)).rows[0].password;
    assert.ok(await compare(usuario.password, guardada));
    await esperar('POST', '/auth/register', usuario, 400, invitacion);
    await esperar('POST', '/auth/login', { email: usuario.email, password: 'incorrecta' }, 401);
    token = (await esperar('POST', '/auth/login', { email: usuario.email, password: usuario.password }, 200)).access_token;
    assert.ok(token);
  });

  await t.test('Salas, géneros y películas con relaciones automáticas y asignación atómica', async () => {
    const sala = await post('/salas', { nombre: 'Illimani', tipo: '3D', capacidad: 8 });
    cine.sala = sala.idSala;
    assert.equal((await patch('/salas/' + cine.sala, { nombre: 'Sala principal' })).capacidad, 8);
    cine.pequena = (await post('/salas', { nombre: 'Sala pequeña', tipo: '2D', capacidad: 1 })).idSala;
    for (const nombre of ['Aventura', 'Drama']) {
      const g = await post('/generos', { nombre, descripcion: 'Descripción de ' + nombre });
      cine[nombre] = g.idGenero;
    }
    await patch('/generos/' + cine.Drama, { descripcion: 'Drama familiar' });
    const pelicula = { titulo: 'La última función', sinopsis: 'Una historia de barrio.', clasificacion: 'ATP', duracionMin: 105 };
    await esperar('POST', '/peliculas', { ...pelicula, idGeneros: [cine.Drama, 777] }, 404);
    assert.equal((await get('/peliculas')).length, 0);
    const creada = await post('/peliculas', { ...pelicula, idGeneros: [cine.Aventura] });
    cine.peli = creada.idPelicula;
    const ruta = '/peliculas/' + cine.peli;
    assert.equal(creada.generos[0].idGenero, cine.Aventura);
    await patch(ruta, { duracionMin: 108 });
    await esperar('POST', ruta + '/generos', { idGeneros: [cine.Drama, 777] }, 404);
    assert.equal((await get(ruta)).generos.length, 1);
    for (let vez = 0; vez < 2; vez++) {
      const r = await esperar('POST', ruta + '/generos', { idGeneros: [cine.Drama] }, 200);
      assert.equal(r.generos.length, 2);
    }
    assert.equal((await get('/generos/' + cine.Drama)).peliculas[0].idPelicula, cine.peli);
    await baja(ruta + '/generos/' + cine.Drama);
    assert.equal((await get('/peliculas'))[0].generos.length, 1);
  });

  await t.test('Clientes, cartelera y validación de llaves foráneas', async () => {
    const cliente = { nombres: 'Ana', paterno: 'Quispe', materno: 'Rojas', email: 'ana@example.com' };
    await esperar('POST', '/clientes', { ...cliente, email: 'correo-invalido' }, 400);
    cine.cliente = (await post('/clientes', cliente)).idCliente;
    await patch('/clientes/' + cine.cliente, { nombres: 'Ana María' });
    const datos = { idSala: cine.sala, idPelicula: cine.peli, fechaHora: '2026-12-12T19:30:00-04:00', precio: 35.5 };
    await esperar('POST', '/funciones', { ...datos, idPelicula: 777 }, 404);
    await esperar('POST', '/funciones', { ...datos, idSala: 777 }, 404);
    await esperar('POST', '/funciones', { ...datos, fechaHora: 'ayer' }, 400);
    cine.funcion = (await post('/funciones', datos)).idFuncion;
    cine.otra = (await post('/funciones', { ...datos, fechaHora: '2026-12-13T19:30:00-04:00' })).idFuncion;
    assert.equal((await get('/salas/' + cine.sala)).funciones.length, 2);
    assert.equal((await get('/peliculas/' + cine.peli)).funciones.length, 2);
    const cartelera = await get('/funciones');
    assert.equal(cartelera[0].sala.idSala, cine.sala);
    assert.equal(cartelera[0].pelicula.idPelicula, cine.peli);
  });

  const venta = (asiento, extra = {}) => ({ idFuncion: cine.funcion, idCliente: cine.cliente, numeroAsiento: asiento, ...extra });
  await t.test('Dos ventas simultáneas dan un 201 y un 400, con precio y aforo correctos', async () => {
    await esperar('POST', '/boletos', venta(1, { idCliente: 777 }), 404);
    await esperar('POST', '/boletos', venta(1, { idFuncion: 777 }), 404);
    for (const asiento of [0, 9, 1.5]) await esperar('POST', '/boletos', venta(asiento), 400);
    const respuestas = await Promise.all([pedir('POST', '/boletos', venta(8)), pedir('POST', '/boletos', venta(8))]);
    assert.deepEqual(respuestas.map((r) => r.estado).sort(), [201, 400]);
    assert.match(respuestas.find((r) => r.estado === 400).dato.message, /asiento 8 ya está ocupado/);
    const vendido = respuestas.find((r) => r.estado === 201).dato;
    cine.boleto = vendido.idBoleto;
    assert.equal(vendido.precioPagado, 35.5);
    const gratis = await post('/boletos', venta(8, { idFuncion: cine.otra, precioPagado: 0 }));
    assert.equal(gratis.precioPagado, 0);
    cine.gratis = gratis.idBoleto;
    cine.segundo = (await post('/boletos', venta(2, { precioPagado: 20 }))).idBoleto;
    assert.equal((await get('/boletos')).length, 3);
    assert.equal((await get('/funciones/' + cine.funcion)).boletos.length, 2);
    const detalle = await get('/boletos/' + cine.boleto);
    assert.equal(detalle.cliente.idCliente, cine.cliente);
    assert.equal(detalle.funcion.idFuncion, cine.funcion);
    const historial = await get('/clientes/' + cine.cliente);
    assert.ok(historial.boletos.every((b) => b.funcion.idFuncion === b.idFuncion));
  });

  await t.test('PATCH respeta el asiento, el precio histórico y la capacidad; anular permite revender', async () => {
    const ruta = '/boletos/' + cine.boleto;
    await esperar('PATCH', ruta, { numeroAsiento: 2 }, 400);
    await esperar('PATCH', ruta, { numeroAsiento: 9 }, 400);
    await esperar('PATCH', ruta, { idCliente: 777 }, 400);
    await esperar('PATCH', ruta, { precioPagado: null }, 400);
    await esperar('PATCH', '/funciones/' + cine.funcion, { idSala: cine.pequena }, 400);
    await esperar('PATCH', '/salas/' + cine.sala, { capacidad: 7 }, 400);
    await patch('/funciones/' + cine.funcion, { precio: 40 });
    assert.equal((await patch(ruta, { numeroAsiento: 7 })).precioPagado, 35.5);
    assert.equal((await patch(ruta, { precioPagado: 25.75 })).precioPagado, 25.75);
    await baja(ruta);
    await esperar('GET', ruta, undefined, 404);
    const reemplazo = await post('/boletos', venta(7));
    assert.equal(reemplazo.precioPagado, 40);
    cine.reemplazo = reemplazo.idBoleto;
    const bajaGuardada = await db.query(`SELECT "eliminadoEn" FROM "${esquema}".boleto WHERE "idBoleto"=$1`, [cine.boleto]);
    assert.ok(bajaGuardada.rows[0].eliminadoEn);
  });

  await t.test('Borrado lógico, referencias eliminadas, errores de parámetros y listas públicas', async () => {
    for (const modulo of modulos) {
      await esperar('GET', '/' + modulo + '/abc', undefined, 400);
      await esperar('GET', '/' + modulo + '/1e2', undefined, 400);
      await esperar('GET', '/' + modulo + '/777', undefined, 404);
    }
    await baja('/generos/' + cine.Drama);
    await esperar('POST', '/peliculas/' + cine.peli + '/generos', { idGeneros: [cine.Drama] }, 404);
    for (const [modulo, ids] of [
      ['boletos', [cine.gratis, cine.segundo, cine.reemplazo]], ['funciones', [cine.funcion, cine.otra]],
      ['clientes', [cine.cliente]], ['peliculas', [cine.peli]], ['generos', [cine.Aventura]], ['salas', [cine.sala, cine.pequena]],
    ]) {
      for (const id of ids) {
        await baja('/' + modulo + '/' + id);
        await esperar('GET', '/' + modulo + '/' + id, undefined, 404);
        await esperar('DELETE', '/' + modulo + '/' + id, undefined, 404);
      }
      assert.deepEqual(await get('/' + modulo), []);
    }
  });
});
