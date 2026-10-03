# Reporte: Lógica del carrito y UI (rama `carrito`)

**Responsable:** Ardan 
**Rama:** carrito

## Parte 1 — Lógica del carrito

Se adaptó el código existente al modelo de conferencias (nombre, lugar, hora, precio y cantidad de tickets), con persistencia y cálculo de totales.

### Estructura del item

```js
{ id, nombre, lugar, hora, precio, cantidad, imagen }
```

### Flujo de datos

- Agregar/eliminar/cambiar cantidad/vaciar → actualiza `itemsCarrito` → `guardarCarrito()` → `htmlCarrito()` re-renderiza la lista y el total.
- Al recargar la página → `cargarCarrito()` restaura los items desde `localStorage`.

## Parte 2 — UI del carrito y separación de responsabilidades

### Separación de responsabilidades

| # | Archivo | Responsabilidad |
|---|---------|-----------------|
| 2.1 | `js/modelo-carrito.js` | Estado (`itemsCarrito`), persistencia y operaciones. |
| 2.2 | `js/vista-carrito.js` | Render (`htmlCarrito`), total y badge. |
| 2.3 | `js/app.js` | Eventos y arranque. |

Se eliminó `js/codigo.js`.

### Iconos

- `img/cart.png` reemplazado por SVG de carrito (responsivo).
- `img/estrellas.png` reemplazado por estrellas `★★★★★` doradas.
- Ícono SVG de basura para eliminar items.

### Comportamiento del carrito

- Badge rojo circular sobre el ícono con el número de items.
- Se abre con **click** (clase `.activo`) en lugar de hover.
- El ícono cambia de color (magenta → rojo) al estar activo.
- Cursor de mano sobre el ícono del carrito.

### Diseño de items en filas

- Cada item es una fila: producto (imagen + nombre).
- Debajo, fila de metadatos: lugar · hora · precio.
- Fila de acciones con dos columnas: modificador `[- xx +]` y total del item.
- Modificador en contenedor redondeado; cursor de mano en los botones y de texto en el número.
- Excepción: con `cantidad === 1`, el botón `-` se reemplaza por ícono de basura.

### Pie del carrito y nueva página

- Total a pagar fijo al final de la lista.
- Botón **Pagar**.
- Botón **Ver carrito** → redirige a `pages/carrito.html`.
- Nueva página `pages/carrito.html` con detalle de items, modificadores, total y opciones (vaciar, seguir comprando).

### Ajustes posteriores

- Eliminado el botón "Vaciar Carrito" del panel del index (queda en `pages/carrito.html`).
- El carrito se cierra al dar click fuera de él.
- El badge no se muestra cuando el carrito está vacío (clase `.oculto` en CSS).
- Corregido: "Ver carrito" no redirigía porque los manejadores de click dentro del panel hacían `preventDefault()`; ahora solo se previene cuando realmente se maneja una acción.
- Total en negritas y más grande (`#total-carrito`, `#total-detalle`: `font-weight: 700; font-size: 2rem`).
- Archivos reorganizados: solo `index.html` en la raíz; `carrito.html` movido a `pages/`; lógica dividida en `js/modelo-carrito.js`, `js/vista-carrito.js` y `js/app.js`.
- Corregido: al cambiar cantidad el panel del carrito se cerraba (el re-render desprendía el nodo clickeado y el handler de "click fuera" lo contaba como fuera). Se agregó `evt.stopPropagation()` en los botones manejados.
- Corregido: "Seguir comprando" en `pages/carrito.html` no navegaba porque `agregarLibro` hacía `preventDefault()` para cualquier click; ahora solo previene cuando el click es sobre un botón "agregar al carrito".

## Pendiente / notas

- La validación de stock por conferencia queda preparada pero depende de que el índice defina los datos de stock.
- La lógica de pago (botón Pagar) se implementará en su propia iteración.
