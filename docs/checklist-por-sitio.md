# Checklist de pruebas por sitio

Usa esta lista antes de publicar cualquier sitio nuevo o actualizado.

## Compra de boleto
- [ ] Puedo seleccionar una boleta disponible, completarla y confirmar la compra.
- [ ] El estado de la boleta cambia a `vendida` en la interfaz y en Supabase (misma `sitio_slug`).
- [ ] Los datos guardados (comprador, celular, vendedor) aparecen en los listados y en la base de datos.
- [ ] La sesión/roles usados (admin o vendedor) funcionan con el header `x-site-slug` correcto.

## Carga de imágenes y assets
- [ ] `hero.svg` y `logo.svg` cargan sin errores 404 en la pestaña _Network_.
- [ ] Los colores y tipografías del sitio coinciden con lo definido en `config.json`.
- [ ] En móviles y desktop, el hero mantiene la relación de aspecto y el logo no se pixela.
- [ ] La caché se invalida al actualizar assets (si cambiaste archivos, incrementa `data-asset-version` en `index.html`).

## Filtrado y listados de datos
- [ ] Los filtros por estado (disponible, reservada, vendida) muestran los totales correctos del sitio.
- [ ] Los filtros/búsquedas por vendedor o comprador devuelven solo resultados del sitio actual (`sitio_slug`).
- [ ] El paginado o scroll infinito (si aplica) no mezcla datos de otros sitios.
- [ ] Los totales de recaudación y conteo de boletas se recalculan después de una compra o reserva.
