# Reporte: carrito completo, páginas dinámicas e integración con pago/ticket

**Responsable:** Ardan
**Rama:** carrito

## Objetivo

Cerrar lo que faltaba del carrito (lógica, funcionalidad y estilo), hacer que las
conferencias se generen desde un `.json` en lugar de una página por item, completar
la relación del carrito con pago y ticket **sin tocar su código**, y verificar rutas
y recursos.

---

## 1. Datos en un solo lugar: `data/conferencias.json`

- Se creó `data/conferencias.json` con **13 conferencias**:
  - las **3 reales** (Física/Netflix, WorldCup bajo los datos, Videojuegos) con su
    descripción y 3 reseñas cada una;
  - **10 de relleno** que usan `img/curso1.jpg` como portada.
- Cada objeto: `id, nombre, ponente, lugar, fecha, hora, cupo, precio, precioAnterior,
  imagen, descripcion, resenas[]`.
- Ya **no** hay una página HTML por conferencia.

## 2. Módulos nuevos

| Archivo | Responsabilidad |
|---|---|
| `js/datos-conferencias.js` | Carga el JSON (`fetch`), getters (`obtenerConferencia(s)`) y **rutas** (`rutaImagen`, `rutaDetalle`, `rutaInicio`, `rutaCarrito`) que funcionan tanto en la raíz como en `pages/`. |
| `js/vista-conferencias.js` | Render del **mosaico del index** (`#grid-conferencias`) y de la **página de detalle** (`#detalle-conferencia`) desde el JSON. |

## 3. Páginas dinámicas

- `index.html`: el mosaico se genera desde el JSON dentro de `#grid-conferencias`
  (se quitaron las 3 tarjetas escritas a mano).
- `pages/conferencia.html`: **una sola** página de detalle que lee `?id=N` y se
  llena desde el JSON.
- Se **eliminaron** `pages/conferencia1.html`, `pages/conferencias2.html` y
  `pages/conferencia3.html`.

## 4. Lógica del carrito (`js/modelo-carrito.js`)

- `leerProducto(boton)` ahora **toma los datos del JSON por `data-id`** (antes los
  raspaba del DOM), con respaldo al DOM si el JSON aún no cargó.
- **Validación de cupo**: no se pueden agregar ni sumar más boletos que el `cupo` de
  la conferencia; muestra aviso.
- `cargarCarrito()` **normaliza** items viejos (precio/cantidad/cupo numéricos).
- Nuevo getter `totalBoletos()` para el badge.
- Se mantienen los getters públicos `obtenerCarrito()` y `totalCarrito()` que ya usaba
  la lógica de pago.

## 5. Vista del carrito (`js/vista-carrito.js`)

- Estado **“Tu carrito está vacío”**.
- Fila con imagen, metadatos y modificador `[- n +]`; con `n === 1` el `-` se vuelve
  un bote de basura (`.borrar-curso`).
- Se usa `totalBoletos()` para el badge.

## 6. Integración con pago y ticket (sin tocar su código)

- **Pago → carrito:** `app.js` escucha el evento `ordenCreada` que emite `pago.js` y
  vacía el carrito (esto es justo el `TODO` que dejó pago.js, resuelto desde el carrito).
- **Carrito → pago:** los enlaces “Finalizar compra” (detalle y página del carrito)
  llevan a `index.html#pagar`; al cargar, `app.js` dispara el click del botón
  `.btn-pagar` para abrir el modal. Se quitó el `id="pagar"` del panel para evitar que
  `pago.js` abriera el modal dos veces (listener directo + delegado).
- **Ticket:** el panel “Ticket” del header sigue leyendo `obtenerCompra()` (export de
  `pago.js`); el carrito solo aporta los items/total de la orden.
- No se modificó `js/pago.js`, `js/ticket-compra.js` ni `js/test-compra.js`.

## 7. Estilos y recursos

- Nuevos estilos: `.grid-conferencias` (CSS Grid responsivo), página del carrito
  (`.carrito-pagina`, resumen y acciones), detalle, modales (`.acciones-confirmacion`,
  `.btn-ver-ticket`) y footer del equipo.
- **Limpieza de recursos**: se eliminaron imágenes sin usar (`cart.png`, `estrellas.png`,
  `producto_*.jpg`, `curso2-5.jpg`, `icono1-3.png`) y el CSS muerto que las referenciaba
  (`lupa.png`, `.icono1-3`, `.barra`, `.contenido-hero`).
- Todas las páginas comparten el mismo header (logo, nav, ticket, carrito) y footer.

## 8. Verificación de rutas y recursos

Levantando el proyecto con un servidor local se comprobó **HTTP 200** en:

```
/  .  /index.html  .  /pages/carrito.html  .  /pages/conferencia.html?id=1
/data/conferencias.json  .  /js/{app,pago,modelo-carrito,vista-carrito,
datos-conferencias,vista-conferencias}.js  .  /css/{normalize,skeleton,custom}.css
/img/{conferencia1,conferencia2,conferencia3,curso1}.jpg
/img/{carrito-icon,bote-basura}.svg  .  /img/fes_logo3.jpg
```

> Importante: como se usan **ES Modules** y `fetch`, el proyecto debe abrirse con un
> servidor (Live Server), no con `file://`.

## 9. Pendiente (fuera del alcance del carrito)

- Pop-up de producto tipo YouTube (TODO #6).
- `ticket.js`: los botones “Ver Ticket” e “Imprimir Ticket” del modal de confirmación
  aún no tienen manejador (es la lógica de ticket, no del carrito).
