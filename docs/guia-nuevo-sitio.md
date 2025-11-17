# Guía para agregar un nuevo sitio

Esta guía explica cómo clonar un sitio existente, subir sus assets y crear los datos asociados en Supabase.

## 1. Crear la carpeta del sitio y su configuración
1. Duplica cualquier sitio existente como base (por ejemplo `default`):
   ```bash
   cp -r assets/sites/default assets/sites/<slug-nuevo>
   ```
2. Abre `assets/sites/<slug-nuevo>/config.json` y actualiza:
   - `id`: usa exactamente el mismo `<slug-nuevo>` que usarás en la base de datos.
   - `name`: nombre visible del sitio.
   - `basePath`: ruta pública (ej. `/mi-sitio`). Debe coincidir con la carpeta que servirá la app.
   - `branding`: textos de títulos y subtítulos que se muestran en la barra superior y el hero.
   - `assets.basePath`: deja `/assets/sites/<slug-nuevo>` para que las imágenes resuelvan correctamente.
3. Registra el sitio en `assets/sites/index.json` agregando un objeto al arreglo `sites` con `id`, `name`, `basePath` y `config` apuntando al nuevo `config.json`.

## 2. Subir assets del sitio
1. Sustituye `hero.svg` y `logo.svg` dentro de `assets/sites/<slug-nuevo>/` por los archivos del nuevo sitio (respeta los nombres para que el loader los encuentre).
2. Si necesitas más recursos estáticos, añádelos en la misma carpeta y referencia su ruta relativa en `config.json` (por ejemplo en `branding.logo` o `assets.heroImage`).
3. Verifica que las rutas que agregues no lleven barras dobles ni falten `/assets/sites/<slug-nuevo>` como prefijo si son relativas.

## 3. Crear datos del sitio en Supabase
Las tablas comparten la columna `sitio_slug` para aislar datos entre sitios (ver `supabase_schema.sql`). Usa el mismo `<slug-nuevo>` que pusiste en `config.json`.

Ejecuta en el editor SQL de Supabase (ajusta cantidades y usuarios):
```sql
-- Configuración base
insert into public.configuracion_sistema (sitio_slug, id, total_boletas, precio_boleta, actualizado_por, fecha_actualizacion)
values ('<slug-nuevo>', 1, 1000, 10000, 'admin', now())
on conflict (sitio_slug, id) do update
set total_boletas = excluded.total_boletas,
    precio_boleta = excluded.precio_boleta,
    actualizado_por = excluded.actualizado_por,
    fecha_actualizacion = excluded.fecha_actualizacion;

-- Administrador principal
insert into public.administradores (username, password_hash, sitio_slug)
values ('admin_<slug-nuevo>', '<hash-sha256-o-bcrypt>', '<slug-nuevo>')
on conflict (sitio_slug, username) do update set password_hash = excluded.password_hash;

-- Vendedor inicial (opcional)
insert into public.vendedores (nombre, username, password_hash, sitio_slug)
values ('Vendedor demo', 'vendedor_<slug-nuevo>', '<hash-sha256-o-bcrypt>', '<slug-nuevo>')
on conflict (sitio_slug, username) do update set password_hash = excluded.password_hash;

-- Genera las boletas disponibles
insert into public.boletas (sitio_slug, numero, estado)
select '<slug-nuevo>', generate_series(1, 1000), 'disponible'
where not exists (
    select 1 from public.boletas b where b.sitio_slug = '<slug-nuevo>'
);
```

**Notas importantes**
- Usa el mismo formato de hash ya utilizado en el proyecto (los ejemplos existentes son cadenas SHA-256 hexadecimales). Cambiar el algoritmo puede romper la autenticación del frontend.
- La política RLS usa el header `x-site-slug`; confirma que el frontend lo envía con el `<slug-nuevo>` para que el filtrado por sitio funcione.
- Si necesitas más campos o tablas, revisa `supabase_schema.sql` para mantener coherencia de índices y políticas.

## 4. Validar en local o preproducción
1. Levanta la app y navega a `/<slug-nuevo>`; confirma que el selector de sitio carga la configuración correcta.
2. Comprueba que el hero y el logo se vean (revisa la pestaña _Network_ si hay errores 404 en assets).
3. Realiza una compra de prueba y verifica en Supabase que la boleta cambió de estado y mantiene el `sitio_slug` esperado.
