//modelo: estado del carrito y persistencia
import { htmlCarrito } from './vista-carrito.js';
import { obtenerConferencia, rutaImagen } from './datos-conferencias.js';

export let itemsCarrito=[]; //lista de items del carrito

//guardar el carrito en localStorage
export function guardarCarrito(){
    localStorage.setItem('carrito',JSON.stringify(itemsCarrito));
}

//normalizar un item cargado (por si viene de una version anterior sin cupo o con precio string)
function normalizarItem(item){
    return {
        ...item,
        id: item.id,
        precio: Number(item.precio) || 0,
        cantidad: Number(item.cantidad) || 1,
        cupo: Number(item.cupo) || 99
    };
}

//cargar el carrito desde localStorage al iniciar
export function cargarCarrito(){
    const datos=JSON.parse(localStorage.getItem('carrito'));
    if(Array.isArray(datos)){
        itemsCarrito=datos.map(normalizarItem);
        htmlCarrito();
    }
}

//leer un producto desde su boton y agregarlo (o sumar cantidad si ya existe)
export function leerProducto(boton){
    const id=boton.getAttribute('data-id');
    const conferencia=obtenerConferencia(id);

    //si los datos estan cargados, la fuente de verdad es el JSON
    if(conferencia){
        agregarConferencia(conferencia);
        return;
    }
    agregarDesdeDOM(boton);
}

//agregar una conferencia del JSON respetando el cupo
function agregarConferencia(conferencia){
    const cupo=Number(conferencia.cupo)||99;
    const existente=itemsCarrito.find(item=>String(item.id)===String(conferencia.id));

    //no permitir mas boletos que el cupo disponible
    if(existente && existente.cantidad>=cupo){
        alert(`No hay mas boletos disponibles para "${conferencia.nombre}".`);
        return;
    }

    const productoInfo={
        id: conferencia.id,
        nombre: conferencia.nombre,
        lugar: conferencia.lugar,
        hora: conferencia.hora,
        precio: Number(conferencia.precio)||0,
        imagen: rutaImagen(conferencia.imagen),
        cupo,
        cantidad: 1
    };

    if(existente){
        itemsCarrito=itemsCarrito.map(item=>String(item.id)===String(conferencia.id)
            ?{...item,cantidad:item.cantidad+1}
            :item);
    }else{
        itemsCarrito=[...itemsCarrito,productoInfo];
    }

    guardarCarrito();
    htmlCarrito();
}

//respaldo: construir el item leyendo el DOM cuando el JSON aun no esta cargado
function agregarDesdeDOM(boton){
    const tarjeta=boton.closest('.card, .tarjeta-compra') || boton.parentElement;
    const precioTexto=boton.dataset.precio
        || tarjeta.querySelector('.precio-actual')?.textContent
        || tarjeta.querySelector('.precio span')?.textContent
        || '';
    const productoInfo={
        imagen: boton.dataset.imagen || tarjeta.querySelector('img')?.src || '',
        nombre: (boton.dataset.nombre || tarjeta.querySelector('.info-card h4, .titulo-detalle')?.textContent || '').trim(),
        lugar: boton.dataset.lugar || tarjeta.querySelector('[data-lugar]')?.textContent?.trim() || '',
        hora: boton.dataset.hora || tarjeta.querySelector('[data-hora]')?.textContent?.trim() || '',
        precio: Number(String(precioTexto).replace('$','').trim())||0,
        id: boton.getAttribute('data-id'),
        cupo: Number(boton.dataset.cupo)||99,
        cantidad: 1
    };

    const existe=itemsCarrito.some(producto=>String(producto.id)===String(productoInfo.id));
    if(existe && itemsCarrito.find(p=>String(p.id)===String(productoInfo.id)).cantidad>=productoInfo.cupo){
        alert('No hay mas boletos disponibles para esta conferencia.');
        return;
    }

    if(existe){
        itemsCarrito=itemsCarrito.map(producto=>{
            if(String(producto.id)===String(productoInfo.id)){
                return {...producto,cantidad:producto.cantidad+1};
            }
            return producto;
        });
    }else{
        itemsCarrito=[...itemsCarrito,productoInfo];
    }

    guardarCarrito();
    htmlCarrito();
}

//eliminar un item del carrito por su id
export function eliminarProducto(evt){
    const boton=evt.target.closest('.borrar-curso');
    if(boton){
        evt.preventDefault();
        evt.stopPropagation();
        const productoId=boton.getAttribute('data-id');
        itemsCarrito=itemsCarrito.filter(producto=>String(producto.id)!==String(productoId))
        guardarCarrito();
        htmlCarrito();
    }
}

//sumar o restar cantidad de un item (si llega a 0 se elimina). no supera el cupo
export function cambiarCantidad(evt){
    const boton=evt.target.closest('button');
    if(!boton) return;
    const id=boton.getAttribute('data-id');
    if(boton.classList.contains('mas')){
        evt.preventDefault();
        evt.stopPropagation();
        const actual=itemsCarrito.find(item=>String(item.id)===String(id));
        if(actual && actual.cantidad>=(Number(actual.cupo)||99)){
            alert(`No hay mas boletos disponibles para "${actual.nombre}".`);
            return;
        }
        itemsCarrito=itemsCarrito.map(item=>String(item.id)===String(id)?{...item,cantidad:item.cantidad+1}:item);
    }else if(boton.classList.contains('menos')){
        evt.preventDefault();
        evt.stopPropagation();
        itemsCarrito=itemsCarrito
            .map(item=>String(item.id)===String(id)?{...item,cantidad:item.cantidad-1}:item)
            .filter(item=>item.cantidad>0);
    }else{
        return;
    }
    guardarCarrito();
    htmlCarrito();
}

//vaciar todo el carrito
export function vaciarCarrito(){
    itemsCarrito=[];
    guardarCarrito();
    htmlCarrito();
}

//calcular el total a pagar
export function totalCarrito(){
    return itemsCarrito.reduce((acum,item)=>acum+Number(item.precio)*item.cantidad,0);
}

//total de boletos (para el badge)
export function totalBoletos(){
    return itemsCarrito.reduce((acum,item)=>acum+item.cantidad,0);
}

//obtener los productos actuales del carrito
export function obtenerCarrito() {
    return itemsCarrito;
}
