# Sistema de cine · TAW-251

Este proyecto reúne las operaciones básicas de un cine: administrar salas, películas, funciones y clientes, además de vender boletos. La API está hecha con NestJS, TypeORM y PostgreSQL. Las operaciones de escritura requieren iniciar sesión y se pueden probar desde Scalar.

## Ejecutar en Windows, macOS o Linux

Instala Node.js 22.18 o superior y ten Docker con el complemento Compose en marcha. Extrae el ZIP y abre una terminal en la carpeta **`sistema-cine`**, donde están `package.json` y `compose.yaml`. Ejecuta en orden:

```sh
npm ci
npm run configurar
docker compose up -d --wait db
npm start
```

`npm run configurar` crea `.env` a partir de `.env.example` y genera la contraseña local de PostgreSQL, el secreto de firma JWT y la clave de registro del personal. Si ya tienes un archivo `.env`, conserva sus valores. `npm start` compila TypeScript y arranca la API.

Abre **[Scalar](http://localhost:3000/docs)** para ver y probar las 34 operaciones. La especificación también está disponible en [formato OpenAPI JSON](http://localhost:3000/openapi.json). Al detener Node con Ctrl+C y ejecutar `docker compose stop db`, los datos quedan guardados en el volumen de PostgreSQL.

### Si ya tienes PostgreSQL instalado

1. Ejecuta `npm ci` y `npm run configurar` en la carpeta del proyecto.
2. En pgAdmin o psql, crea una base de datos para esta práctica con tu usuario como propietario. Por ejemplo, si ya estás conectado con ese usuario, ejecuta `CREATE DATABASE cine;`.
3. Edita `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` en `.env` con los datos de tu instalación.
4. Ejecuta `npm start`. Para la práctica, `DB_SYNC=true` permite que TypeORM cree las tablas a partir de las entidades al arrancar. Usa una base dedicada al proyecto.

## Primera venta desde Scalar

1. Abre `POST /auth/register` y selecciona **Test Request**. En el encabezado `x-clave-registro`, pega el valor de `CLAVE_REGISTRO` de tu `.env`. En el cuerpo escribe tu `username`, `email` y `password`. La clave de registro la comparten quienes estén autorizados a dar de alta personal.
2. Ejecuta `POST /auth/login` con el email y la contraseña registrados. Copia el valor de `access_token`. En **Authentication** selecciona **Bearer** y pega el token. Dura dos horas. Las consultas GET son públicas.
3. Crea los registros en el orden de la tabla. En cada paso, reemplaza los identificadores de ejemplo por los que devuelva tu API. Los importes y números de asiento se envían como números JSON.

| Paso | Operación | Cuerpo de ejemplo |
| --- | --- | --- |
| 1 | `POST /salas` | `{"nombre":"Sala Illimani","tipo":"3D","capacidad":8}` |
| 2 | `POST /generos` | `{"nombre":"Aventura","descripcion":"Historias de viajes y exploración."}` |
| 3 | `POST /peliculas` | `{"titulo":"La última función","sinopsis":"Una proyeccionista intenta salvar el cine de su barrio.","duracionMin":105,"clasificacion":"ATP","idGeneros":[1]}` |
| 4 | `POST /funciones` | `{"idSala":1,"idPelicula":1,"fechaHora":"2026-12-12T19:30:00-04:00","precio":35.50}` |
| 5 | `POST /clientes` | `{"nombres":"Ana María","paterno":"Quispe","materno":"Rojas","email":"ana@example.com"}` |
| 6 | `POST /boletos` | `{"idFuncion":1,"idCliente":1,"numeroAsiento":3}` |

La primera venta devuelve `201` y un `precioPagado` de `35.5` con estos datos. Si repites el paso 6, recibirás `400` con el número del asiento ocupado. Con `DELETE /boletos/{id}` puedes anular la primera venta y volver a vender el asiento. Prueba también el asiento 9 para una sala de 8 plazas.

Para ver la venta desde ambos lados, consulta `GET /clientes/{id}`, que incluye los boletos y sus funciones, y `GET /funciones/{id}`, que incluye la sala, la película y sus boletos activos.

## Organización del código

Cada carpeta de recurso en `src/` contiene su módulo, entidad, controlador, servicio y DTOs de creación y actualización. El controlador recibe solicitudes, el servicio aplica las reglas de negocio y el repositorio de TypeORM consulta o escribe en PostgreSQL.

| Recurso | Implementación |
| --- | --- |
| Salas y funciones | Una sala programa varias funciones. Cada función referencia una sola sala. |
| Películas y funciones | Una película puede proyectarse en varias funciones. |
| Películas y géneros | `@ManyToMany` y `@JoinTable` crean `pelicula_genero` con dos llaves. Las asignaciones se gestionan desde `/peliculas/{id}/generos`. |
| Clientes y funciones | La entidad `Boleto` guarda las dos llaves foráneas, el asiento y el precio pagado. |
| Auditoría | Las entidades heredan `creadoEn`, `actualizadoEn` y `eliminadoEn`. Las bajas de recursos usan `softDelete`. Quitar un género de una película elimina solo su asociación. |
| Autenticación | `src/auth/` registra personal, verifica contraseñas con bcrypt y protege las escrituras con un guard JWT. |

En `src/boletos/boletos.service.ts` se valida el asiento contra la capacidad de la sala. Al vender, omitir `precioPagado` aplica la tarifa de la función. Un PATCH de asiento conserva el importe histórico. El índice único parcial de `src/boletos/boleto.entity.ts` protege la combinación función–asiento entre boletos activos, incluso si dos transacciones se ejecutan a la vez.

Los cambios de capacidad de una sala y los traslados de una función también comprueban los asientos vendidos. Una referencia inexistente devuelve `404`. Un dato inválido o un asiento ocupado devuelve `400`. Una escritura sin autorización devuelve `401`.

## Pruebas automáticas

Con PostgreSQL en marcha y `.env` configurado, ejecuta:

```sh
npm test
```

Las pruebas compilan y levantan su propia API en un puerto libre. Usan un esquema temporal en la base configurada y lo eliminan al terminar. El usuario de PostgreSQL necesita permiso para crear esquemas. El usuario creado por el Compose incluido ya dispone de ese permiso.

La suite recorre las 34 operaciones y comprueba las relaciones, la validación de campos y llaves foráneas, las bajas lógicas, el control de acceso, el precio por defecto, las ventas simultáneas y la reventa tras anulación. El código está en `test/cine.e2e.mjs`.

## Entrega en GitHub

La captura incluida se tomó con la API en funcionamiento. Abre la imagen a tamaño completo para leer las rutas y los métodos HTTP del panel lateral.

[Ver captura completa de Scalar](docs/scalar-endpoints.png)

![Documentación Scalar con las 34 operaciones de la API](docs/scalar-endpoints.png)

Para entregar desde tu cuenta, crea un repositorio vacío en GitHub, copia su URL y ejecuta estos comandos desde la carpeta del proyecto. Sustituye la URL del ejemplo por la de tu repositorio.

```sh
git init
git add .
git commit -m "Sistema de gestión de cine con NestJS"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

El archivo `.gitignore` excluye `.env`, las dependencias instaladas y la compilación. El repositorio incluye `.env.example` para que otra persona pueda configurar su propia copia.
