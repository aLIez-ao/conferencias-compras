//vista: render del listado (index) y del detalle de una conferencia desde el JSON
import { obtenerConferencias, obtenerConferencia, rutaImagen, rutaDetalle, promedioEstrellas } from './datos-conferencias.js';

//dibuja las estrellas rellenas/vacias de una calificacion (0 a 5)
function estrellas(calificacion){
    const n = Math.max(0, Math.min(5, Math.round(Number(calificacion) || 0)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
}

//tarjeta de una conferencia para el mosaico del index
function tarjetaConferencia(conf){
    return `
    <article class="card">
        <a href="${rutaDetalle(conf.id)}">
            <div class="imagen-conferencia">
                <img src="${rutaImagen(conf.imagen)}" class="imagen-curso u-full-width" alt="${conf.nombre}">
            </div>
        </a>
        <div class="info-card">
            <a href="${rutaDetalle(conf.id)}" class="enlace-card">
                <h4>${conf.nombre}</h4>
            </a>
            <p class="ponente">${conf.ponente}</p>
            <span class="estrellas">${estrellas(promedioEstrellas(conf))}</span>
            <div class="precio">
                <span class="precio-anterior">$${conf.precioAnterior}</span>
                <span class="precio-actual">$${conf.precio}</span>
            </div>
            <a href="#" class="u-full-width button agregar-carrito" data-id="${conf.id}">
                Agregar al carrito
            </a>
        </div>
    </article>`;
}

//dibujar el mosaico del index
export function renderListaConferencias(){
    const contenedor = document.querySelector('#grid-conferencias');
    if(!contenedor) return;
    contenedor.innerHTML = obtenerConferencias().map(tarjetaConferencia).join('');
}

//bloque de reseñas del detalle
function bloqueResenas(conf){
    if(!conf.resenas?.length) return '';
    const resenas = conf.resenas.map(r => `
        <div class="resena-box">
            <span class="estrellas-detalle">${estrellas(r.calificacion)}</span>
            <strong>${r.autor}</strong> <span class="resena-tiempo">- ${r.tiempo}</span>
            <p>${r.texto}</p>
        </div>`).join('');

    return `
        <h3 class="subtitulo-resenas">Reseñas de asistentes (${conf.resenas.length})</h3>
        <div class="resenas-contenedor">${resenas}</div>`;
}

//dibujar la pagina de detalle de una conferencia por id
export function renderDetalleConferencia(id){
    const contenedor = document.querySelector('#detalle-conferencia');
    if(!contenedor) return;

    const conf = obtenerConferencia(id);
    if(!conf){
        contenedor.innerHTML = `<div class="conferencia-vacia"><h2>Conferencia no encontrada</h2>
            <p>La conferencia que buscas no existe o fue dada de baja.</p>
            <a href="${document.querySelector('#volver-inicio')?.getAttribute('href') || 'index.html'}" class="button">Volver al inicio</a></div>`;
        return;
    }

    contenedor.innerHTML = `
    <div class="row">
        <div class="eight columns">
            <img src="${rutaImagen(conf.imagen)}" alt="${conf.nombre}" class="detalle-imagen u-full-width">
            <h1 class="titulo-detalle">${conf.nombre}</h1>
            <p class="ponente-detalle">Impartido por: ${conf.ponente}</p>

            <h3 class="subtitulo-resenas">Acerca de esta conferencia</h3>
            <p>${conf.descripcion}</p>

            ${bloqueResenas(conf)}
        </div>

        <div class="four columns">
            <div class="tarjeta-compra">
                <h4 class="titulo-tarjeta-compra">Detalles del Evento</h4>
                <ul class="lista-detalles">
                    <li><strong>Lugar:</strong> ${conf.lugar}</li>
                    <li><strong>Fecha:</strong> ${conf.fecha}</li>
                    <li><strong>Horario:</strong> ${conf.hora}</li>
                    <li><strong>Cupo:</strong> Limitado a ${conf.cupo} personas</li>
                </ul>

                <div class="precio-caja">
                    <span class="precio-anterior">$${conf.precioAnterior}</span>
                    <span class="precio-actual">$${conf.precio}</span>
                </div>

                <a href="#" class="u-full-width button agregar-carrito btn-comprar" data-id="${conf.id}">
                    Agregar al carrito
                </a>
                <p class="garantia">Garantía de reembolso de 7 días</p>
            </div>
        </div>
    </div>`;
}
