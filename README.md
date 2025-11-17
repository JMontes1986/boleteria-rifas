# Boletería & Rifas

Front de administración y visualización de boletas que carga la configuración de cada sitio desde `assets/sites/`. El proyecto es totalmente estático (HTML/CSS/JS) y puede publicarse en Netlify u otro hosting estático.

## Estructura del proyecto
- `index.html`: landing y selector de sitios.
- `admin.html`: hub administrativo para inspeccionar sitios existentes y generar nuevas configuraciones.
- `assets/`: estilos, scripts y archivos de cada sitio.
  - `assets/sites/index.json`: catálogo central con los sitios disponibles.
  - `assets/sites/<slug>/config.json`: configuración de marca, rutas de assets y textos del sitio.
  - `assets/css/styles.css`: estilos compartidos y del hub de admin.
  - `assets/js/admin-hub.js`: lógica del hub de admin (lectura de index.json, carga de configs y generador de snippets).
- `docs/`: guías y checklists para agregar sitios y validar flujos.
- `supabase_schema.sql`: referencia del esquema y políticas usadas en Supabase.

## Cómo ejecutar en local
1. Instala un servidor estático (por ejemplo `npm install -g serve` o usa `python -m http.server`).
2. Desde la raíz, levanta el servidor apuntando a `./` (por ejemplo `npx serve .` o `python -m http.server 8080`).
3. Abre `http://localhost:3000` (o el puerto que definas) para ver la app principal y `http://localhost:3000/admin` para el hub de administración.

## Uso del hub de administración (`/admin`)
El hub ayuda a mantener múltiples sitios sin tocar archivos a mano.

1. **Inventario de sitios:** lee `assets/sites/index.json` y muestra tarjetas con `id`, nombre, basePath y ruta de `config.json`. Puedes recargar el listado con "Actualizar listado".
2. **Detalle de configuración:** al seleccionar un sitio se descarga su `config.json`, se muestran los textos de marca, rutas de assets y una vista previa del snippet para `index.json`. Incluye un bloque SQL para crear los registros base en Supabase usando el `sitio_slug`.
3. **Generador de nuevos sitios:** completa los campos del formulario para producir automáticamente:
   - Un `config.json` listo para guardar en `assets/sites/<slug>/`.
   - Una entrada para `assets/sites/index.json` con `id`, `name`, `basePath` y `config`.
   - Un SQL de checklist para poblar `configuracion_sistema`, `administradores` y `vendedores` en Supabase.
   Puedes copiar los snippets al portapapeles o descargar el `config.json` generado.
4. **Checklist de publicación:** el hub muestra recordatorios rápidos: guardar `config.json` y assets (`hero.svg`, `logo.svg`), registrar el sitio en `index.json`, crear datos en Supabase con el `sitio_slug` correcto y probar el sitio en su `basePath`.

## Crear un sitio sin el hub
También puedes seguir la guía manual en `docs/guia-nuevo-sitio.md` y validar con `docs/checklist-por-sitio.md` si prefieres editar archivos directamente.
