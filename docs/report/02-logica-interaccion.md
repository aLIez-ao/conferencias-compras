# Cómo funcionan las lógicas y cómo se conectan

## La idea central

Todo el sistema gira alrededor de **un flujo principal**: el usuario ve conferencias → agrega tickets al carrito → paga → recibe su ticket. Cada lógica es un eslabón de esa cadena, y todas comparten información (qué hay en el carrito, cuánto cuesta, quién compró, etc.).

---

## 1. El carrito (Ardan) — el "corazón"

**Qué hace:** mantiene una lista de items (`{id, nombre, lugar, hora, precio, cantidad}`), permite agregar, eliminar, cambiar cantidades y vaciar.

**Cómo se comunica con el resto:**
- **Persiste en `localStorage`**, así que aunque recargues la página, el carrito no se pierde. Esto lo hace visible para las otras páginas (index y página de detalle).
- **Calcula el total**, que es el dato clave que usarán el pago y el ticket.
- Todo lo demás **depende** de él: sin carrito no hay nada que pagar ni que ticketar.

## 2. Pago (jesus) — el "evento disparador"

**Qué hace:** abre una ventana emergente con métodos de pago (tarjeta, PayPal, transferencia), valida los datos, simula el procesamiento y confirma.

**Cómo se comunica:**
- **Lee del carrito:** el total a cobrar y los items.
- **Si el pago se confirma, le dice al carrito:** "vacía todo" → el carrito se limpia y `localStorage` se borra.
- **Le pasa una orden al ticket:** método de pago, total, items, fecha. Es el puente entre carrito y ticket.

## 3. Ticket (lemus) — la "salida" del flujo

**Qué hace:** con la orden recibida, construye el comprobante (conferencia, lugar, hora, cantidad, total, código/QR), lo muestra, permite imprimirlo o descargarlo, y guarda el historial en `localStorage`.

**Cómo se comunica:**
- **Recibe del pago:** la orden confirmada.
- **No escribe en el carrito**, solo lo lee (sus items) para construir el comprobante.
- El historial en `localStorage` permite que el usuario vea compras pasadas aunque el carrito esté vacío.

## 4. Index + página individual (jesus) — la "vitrina"

**Qué hace:** lista las 3 conferencias (con datos desde un JSON), cada una enlaza a su página de detalle, y desde ahí se agrega al carrito.

**Cómo se comunica:**
- **Provee los datos** que el carrito guarda (nombre, lugar, hora, precio).
- **Reutiliza el mismo carrito** en ambas páginas gracias a `localStorage`.

## 5. Pop-up tipo YouTube (ardan) — el "atajo"

**Qué hace:** al pasar el mouse o hacer clic en una tarjeta, muestra una vista previa con "agregar al carrito" sin salir del index.

**Cómo se comunica:**
- **Lee los datos** del JSON de conferencias (atributos `data-*`).
- **Llama a la misma función del carrito** (`agregar`), no duplica lógica.

## 6. CSS (jesus) — la "capa visual"

No tiene lógica propia, pero **da forma** a modales, carrito, tarjetas y ticket (incluida la vista de impresión). Su trabajo es puramente visual sobre el markup que las otras lógicas generan.

## 7. Documentación (lemus) — el "manual"

Describe el flujo completo y cada módulo para que el equipo entienda cómo encaja todo.

---

## El flujo completo (cómo interactúan)

```
Index/Detalle (4) ──> Carrito (1) ──> [Pagar] ──> Pago (2) ──> Ticket (3)
        ▲                  │                            │
        └──── Pop-up (6) ──┘                            └─> vacía el carrito
                                                          guarda historial (3)
```

En palabras: el usuario navega por el index o el pop-up, junta tickets en el carrito, al pagar se valida y procesa, al confirmarse se vacía el carrito y se genera el ticket con su orden e historial. Todo persiste en `localStorage`, que es el "pegamento" que une las piezas.

## Orden de dependencias

1. Index + CSS (estructura y datos) → 2. Carrito (lo que hay que vender) → 3. Pop-up (usa el carrito) → 4. Pago (lee el total) → 5. Ticket (depende del pago) → 6. Documentación (al final).
