# Reporte: Migración a estructura MVC

**Fecha:** 03/10/2026
**Rama:** `mvc` (creada desde `carrito`)

## Objetivo

Convertir la página estática en una aplicación con patrón **Modelo-Vista-Controlador** usando Node.js y Express, según `docs/notas.md`.

## Estructura resultante

```
├── server.js                  # Punto de entrada: configura Express, vistas EJS, estáticos y rutas
├── package.json               # Dependencias (express, ejs) y script "start"
├── data/
│   └── conferencias.json      # Datos de las 3 conferencias (fuente de datos)
├── models/
│   └── conferenciaModel.js    # Modelo: lee el JSON (todas(), porId(id))
├── controllers/
│   └── conferenciaController.js  # Controlador: index y detalle
├── routes/
│   └── conferencias.js        # Rutas: GET / y GET /conferencia/:id
├── views/
│   ├── index.ejs              # Vista: listado de conferencias
│   └── conferencia.ejs        # Vista: detalle por conferencia
└── public/
    ├── css/  js/  img/        # Estáticos (movidos desde la raíz)
```

## Flujo MVC

1. El usuario entra a `/` → `routes/conferencias.js` delega en `conferenciaController.index`.
2. El controlador pide los datos al **modelo** (`conferenciaModel.todas()`).
3. El controlador renderiza la **vista** `views/index.ejs` con esa lista.
4. Al entrar a `/conferencia/2`, el controlador busca con `porId(2)` y renderiza `conferencia.ejs`.
5. El carrito (`public/js/codigo.js`) sigue en el navegador y funciona en ambas vistas.

## Commits en la rama `mvc`

| Commit | Descripción |
|--------|-------------|
| `40b798d` | Estructura base MVC, assets movidos a `public/`, package.json con express y ejs |
| `b02660d` | Modelo, controlador, rutas, `server.js` y vistas EJS; `index.html` migrado |
| `d916832` | Script `npm start` y carrito tolerante en la página de detalle |
| `369b083` → reescritos | gitignore reescrito en UTF-8 |
| `3fa4dd2` | gitignore: ignorar `.tmp/` |

## Verificación

- `GET /` responde y lista las conferencias.
- `GET /conferencia/1` responde con detalle, reseñas y precio.
- `node server.js` / `npm start` levantan el servidor en `http://localhost:3000`.

## Notas / pendientes

- `index.html` se eliminó y fue reemplazado por `views/index.ejs`.
- El carrito se mantiene en cliente (localStorage); una futura mejora sería moverlo al servidor con sesiones.
- Los datos hoy viven en `data/conferencias.json`; se puede cambiar por una base de datos sin tocar controladores ni vistas.
