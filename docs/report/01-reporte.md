# Reporte: Plan de implementación de TODO.md

**Proyecto:** tickets — tienda de tickets para conferencias (Web II)

## Contexto del proyecto

Actualmente el proyecto es una página estática con:

- `index.html`: listado tipo mosaico de productos (productos) con tarjetas, carrito en el header y footer.
- `js/codigo.js`: lógica vanilla del carrito (`itemsCarrito`, `agregarProducto`, `eliminarProducto`, `HtmlCarrtio`).
- `css/`: `normalize.css`, `skeleton.css`, `custom.css`.
- `docs/notas.md`: definición del proyecto — publicidad de conferencias (3), reseñas, tickets, nombre de conferencia, lugar, hora, precio, total, pago con ventana emergente y confirmación.

El TODO asigna estas necesidades y responsables:

| # | Necesidad | Responsable |
|---|-----------|-------------|
| 1 | Lógica del carrito | Ardan |
| 2 | Lógica de pago | jesus |
| 3 | Lógica del ticket | lemus |
| 4 | Index y página individual por conferencia | jesus |
| 5 | CSS | jesus |
| 6 | Pop-up de productos en index (tipo YT) | ardan |
| 7 | Documentación | lemus |

---

## 1. Lógica del carrito (Ardan)

**Objetivo:** adaptar `js/codigo.js` al modelo de conferencias (nombre, lugar, hora, precio, cantidad de tickets).

**Propuesta:**

1. Refactorizar el estado en un objeto/módulo `carrito` con estructura clara:
   ```js
   let itemsCarrito = []; // {id, nombre, lugar, hora, precio, cantidad}
   ```
2. Persistir en `localStorage` (`guardarCarrito()` / `cargarCarrito()`) para que el carrito sobreviva recargas.
3. Extraer eventos a `registrarListener()` existente: agregar, eliminar, cambiar cantidad (+/−), vaciar.
4. Calcular y mostrar **total** en el submenu del carrito.
5. Corregir/limpiar puntos del código actual:
   - `eliminarProducto` compara `producto.id !== productoId` (string vs number) — normalizar tipos.
   - `precio: producto.querySelector('.precio span').textContent` mantiene el `$`; parsear a número para sumar totales.
   - Renombrar `HtmlCarrtio()` → `htmlCarrito()` y `limpiarHTNL()` → `limpiarHTML()`.
6. Validar stock/límite por conferencia si aplica.

**Archivos a tocar:** `js/codigo.js` (o nuevo `js/carrito.js`), `index.html` (ids del total).

---

## 2. Lógica de pago (jesus)

**Objetivo:** al pagar, abrir una ventana emergente con diversas formas de pago; al confirmar, mostrar confirmación y reiniciar.

**Propuesta:**

1. Botón "Pagar" en el carrito que abre un **modal de pago** (`div` oculto + clase `.activo`, o `<dialog>`).
2. Opciones de pago: tarjeta (número, titular, expiración, CVV), PayPal y/o transferencia. Tabs o radios para elegir método.
3. Validaciones del formulario (campos requeridos, formato básico de tarjeta, CVV numérico).
4. Al enviar: simular procesamiento (`setTimeout` / mensaje "Procesando...") y mostrar modal de **confirmación** con número de orden.
5. Tras confirmar: `itemsCarrito = []`, limpiar `localStorage`, refrescar `htmlCarrito()` y cerrar modales.
6. Manejar errores: pago rechazado simulado con reintento.

**Archivos:** `js/pago.js`, `index.html` (modales), `css/custom.css` (estilos modal).

---

## 3. Lógica del ticket (lemus)

**Objetivo:** generar el ticket/comprobante de la compra.

**Propuesta:**

1. Al confirmar el pago, construir un objeto `orden`:
   ```js
   { id: crypto.randomUUID(), fecha, items: [...], total, metodoPago }
   ```
2. Renderizar el ticket en un modal o en una nueva vista: nombre de conferencia, lugar, hora, cantidad, precio unitario, total, código/QR.
3. Opción "Descargar ticket" (imprimir con `window.print()` o generar imagen/PDF con una librería).
4. Guardar el historial de órdenes en `localStorage`.
5. Generar un código QR simple (librería o enlace externo) por ticket para validación en la entrada.

**Archivos:** `js/ticket.js`, nuevo contenedor en `index.html` o `ticket.html`.

---

## 4. Index y página individual por conferencia (jesus)

**Objetivo:** el index lista conferencias; cada una enlaza a su página de detalle.

**Propuesta:**

1. Estructura con Node (MVC, según `docs/notas.md`) o estático primero y migrar después:
   - Opción A (rápida): `index.html` con tarjetas de conferencias (imagen, nombre, lugar, hora, precio, reseña) y enlaces `conferencia.html?id=1`.
   - Opción B (con Node): servidor Express, vistas con plantillas (EJS/Handlebars), controlador de conferencias.
2. `conferencia.html` (o ruta `/conferencia/:id`): detalle completo — descripción, reseñas (3), fotos, lugar, hora, precio, botón agregar al carrito.
3. Reusar el mismo `js/codigo.js`/`carrito.js` en ambas páginas.
4. Datos de las 3 conferencias en un JSON (`data/conferencias.json`) o en un array JS.

**Archivos:** `index.html`, `conferencia.html` (nuevo), `js/` (compartido), opcional `server.js`, `package.json`.

---

## 5. CSS (jesus)

**Objetivo:** estilos consistentes para index, detalle, carrito, modales y ticket.

**Propuesta:**

1. Organizar `css/custom.css` por secciones con comentarios: header/carrito, hero, tarjetas, botones, modal, ticket, footer.
2. Tarjetas en CSS Grid (`grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`) en vez de columnas manuales, para responsive.
3. Estilos para modal de pago y confirmación (overlay, centrado, transición).
4. Página de ticket con formato imprimible (ancho limitado, Ocultar header/footer con `@media print`).
5. Mantener `skeleton.css`/`normalize.css`; solo sobrescribir en `custom.css`.
6. Paleta y tipografía coherentes con el logo FES.

**Archivos:** `css/custom.css`.

---

## 6. Pop-up de productos en index (tipo YouTube) (ardan)

**Objetivo:** al hacer clic en una tarjeta (o pasar el mouse) en el index, mostrar un pop-up con vista previa del producto, estilo YouTube.

**Propuesta:**

1. Hover sobre tarjeta → mostrar miniatura/preview (imagen ampliada, descripción corta, precio) tras pequeño retraso (`setTimeout`), como el preview de YouTube.
2. Clic en tarjeta → abrir modal con detalle + botón "Agregar al carrito" (alternativa rápida sin ir a la página individual).
3. Implementar con un solo elemento `#popup-producto` posicionado de forma absoluta/fija, llenado dinamicamente desde `data/conferencias.json`.
4. Cerrar al hacer clic fuera, presionar `Esc` o moverse a otro producto.
5. Datos en atributos `data-*` de cada tarjeta para evitar consultas.

**Archivos:** `js/popup.js`, `index.html`, `css/custom.css`.

---

## 7. Documentación (lemus)

**Objetivo:** documentar el proyecto.

**Propuesta:**

1. `README.md` en la raíz: descripción, cómo ejecutar (abrir `index.html` o `npm install && npm start` si se usa Node), estructura de carpetas, capturas.
2. Actualizar `docs/notas.md` o crear `docs/` con:
   - Arquitectura (MVC si aplica) y flujo de compra (carrito → pago → ticket).
   - Descripción de cada módulo JS y sus funciones.
   - Créditos del equipo (cada miembro y su parte).
3. Comentarios en el código JS existente (estilo del proyecto).
4. Mantener `docs/urls.txt` con las referencias utilizadas.

**Archivos:** `README.md` (nuevo), `docs/`.

---

## Orden de trabajo sugerido

1. **Index y páginas de conferencias (jesus)** y **CSS base (jesus)** — define la estructura visual.
2. **Carrito (Ardan)** — depende del markup del index.
3. **Pop-up (Ardan)** — depende del index y del carrito.
4. **Pago (jesus)** — depende del total del carrito.
5. **Ticket (lemus)** — depende del pago confirmado.
6. **Documentación (lemus)** — al final, con el proyecto funcional.

## Riesgos / dependencias

- Las partes 2, 3 y 6 dependen del carrito con total correctamente calculado.
- Si se adopta Node.js (MVC), coordinar primero cómo se comparten datos (JSON o API) entre las páginas.
- Mantener compatibilidad: no romper el carrito actual mientras se refactoriza.
