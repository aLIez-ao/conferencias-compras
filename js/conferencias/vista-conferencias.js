//vista: render del listado (index) y del detalle de una conferencia desde el JSON
import { obtenerConferencias, obtenerConferencia, rutaImagen, rutaDetalle, rutaInicio } from './datos-conferencias.js';

//portada: imagen real o un recuadro "EXAMPLE" para las conferencias de ejemplo
function portadaConferencia(conf, claseImagen){
    if(conf.imagen){
        return `<img src="${rutaImagen(conf.imagen)}" class="${claseImagen}" alt="${conf.nombre}">`;
    }
    return `<div class="portada-ejemplo" role="img" aria-label="Portada de ejemplo">EXAMPLE</div>`;
}

//tarjeta de una conferencia para el mosaico del index
function tarjetaConferencia(conf){
    return `
    <article class="card">
        <a href="${rutaDetalle(conf.id)}">
            <div class="imagen-conferencia">
                ${portadaConferencia(conf, 'imagen-curso u-full-width')}
            </div>
        </a>
        <div class="info-card">
            <a href="${rutaDetalle(conf.id)}" class="enlace-card">
                <h4>${conf.nombre}</h4>
            </a>
            <p class="ponente">${conf.ponente}</p>
            <ul class="card-datos">
                <li><span class="dato-etiqueta">Fecha</span><span class="dato-valor">${conf.fecha}</span></li>
                <li><span class="dato-etiqueta">Horario</span><span class="dato-valor">${conf.hora}</span></li>
                <li><span class="dato-etiqueta">Lugar</span><span class="dato-valor">${conf.lugar}</span></li>
            </ul>
            <div class="precio">
                <span class="precio-anterior">$${conf.precioAnterior}</span>
                <span class="precio-actual">$${conf.precio}</span>
            </div>
            <div class="card-botones">
                <a href="#" class="button agregar-carrito" data-id="${conf.id}">Agregar al carrito</a>
                <a href="#" class="button btn-comprar comprar-ahora" data-id="${conf.id}">Comprar ahora</a>
            </div>
        </div>
    </article>`;
}

//dibujar el mosaico del index
export function renderListaConferencias(){
    const contenedor = document.querySelector('#grid-conferencias');
    if(!contenedor) return;
    contenedor.innerHTML = obtenerConferencias().map(tarjetaConferencia).join('');
}

//bloque de datos atractivo del detalle
function bloqueDatos(conf){
    return `
    <ul class="detalle-datos">
        <li class="dato-item">
            <span class="dato-etiqueta">Lugar</span>
            <span class="dato-valor">${conf.lugar}</span>
        </li>
        <li class="dato-item">
            <span class="dato-etiqueta">Fecha</span>
            <span class="dato-valor">${conf.fecha}</span>
        </li>
        <li class="dato-item">
            <span class="dato-etiqueta">Horario</span>
            <span class="dato-valor">${conf.hora}</span>
        </li>
        <li class="dato-item">
            <span class="dato-etiqueta">Cupo</span>
            <span class="dato-valor">Limitado a ${conf.cupo} personas</span>
        </li>
    </ul>`;
}

//dibujar la pagina de detalle de una conferencia por id
export function renderDetalleConferencia(id){
    const contenedor = document.querySelector('#detalle-conferencia');
    if(!contenedor) return;

    const conf = obtenerConferencia(id);
    if(!conf){
        contenedor.innerHTML = `<div class="conferencia-vacia"><h2>Conferencia no encontrada</h2>
            <p>La conferencia que buscas no existe o fue dada de baja.</p>
            <a href="${rutaInicio()}" class="button">Volver al inicio</a></div>`;
        return;
    }

    contenedor.innerHTML = `
    <div class="row">
        <div class="eight columns">
            <span class="detalle-categoria">Conferencia</span>
            <h1 class="titulo-detalle">${conf.nombre}</h1>
            <p class="ponente-detalle">Impartido por: ${conf.ponente}</p>

            ${portadaConferencia(conf, 'detalle-imagen u-full-width')}

            <h3 class="subtitulo-datos">Acerca de esta conferencia</h3>
            <p class="detalle-descripcion">${conf.descripcion}</p>

            <h3 class="subtitulo-datos">Datos del evento</h3>
            ${bloqueDatos(conf)}
        </div>

        <div class="four columns">
            <div class="tarjeta-compra">
                <span class="detalle-categoria">Boletos</span>
                <div class="precio-caja">
                    <span class="precio-anterior">$${conf.precioAnterior}</span>
                    <span class="precio-actual">$${conf.precio}</span>
                </div>
                <p class="precio-nota">Precio por persona · IVA incluido</p>

                <a href="#" class="u-full-width button agregar-carrito btn-comprar" data-id="${conf.id}">
                    Agregar al carrito
                </a>
                <a href="#" class="u-full-width button btn-comprar comprar-ahora" data-id="${conf.id}">
                    Comprar ahora
                </a>
                <p class="garantia">Garantía de reembolso de 7 días</p>
            </div>
        </div>
    </div>`;
}
