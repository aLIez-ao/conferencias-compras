//modelo: estado del carrito y persistencia
import { htmlCarrito } from './vista-carrito.js';

export let itemsCarrito=[]; //lista de items del carrito

//guardar el carrito en localStorage
export function guardarCarrito(){
    localStorage.setItem('carrito',JSON.stringify(itemsCarrito));
}

//cargar el carrito desde localStorage al iniciar
export function cargarCarrito(){
    const datos=JSON.parse(localStorage.getItem('carrito'));
    if(datos){
        itemsCarrito=datos;
        htmlCarrito();
    }
}

//leer los datos de un producto desde su boton y agregarlo (o sumar cantidad si ya existe)
export function leerProducto(boton){
    //tarjeta que envuelve el boton, y contenedor de la pagina como respaldo
    const tarjeta=boton.closest('.card, .tarjeta-compra') || boton.parentElement;
    const contenedor=tarjeta.closest('.container') || document;
    const precioTexto=boton.dataset.precio
        || tarjeta.querySelector('.precio-actual')?.textContent
        || tarjeta.querySelector('.precio span')?.textContent
        || '';
    const productoInfo={
        imagen: boton.dataset.imagen
            || tarjeta.querySelector('img')?.src
            || contenedor.querySelector('img')?.src
            || '',
        nombre: (boton.dataset.nombre
            || tarjeta.querySelector('.info-card h4')?.textContent
            || contenedor.querySelector('h1')?.textContent
            || '').trim(),
        lugar: boton.dataset.lugar || tarjeta.querySelector('[data-lugar]')?.textContent?.trim() || '',
        hora: boton.dataset.hora || tarjeta.querySelector('[data-hora]')?.textContent?.trim() || '',
        precio: Number(String(precioTexto).replace('$','').trim()),
        id: boton.getAttribute('data-id'),
        cantidad: 1
    }

    const existe=itemsCarrito.some(producto=>String(producto.id)===String(productoInfo.id));

    //si ya existe solo se aumenta la cantidad
    if(existe){
        itemsCarrito=itemsCarrito.map(producto=>{
            if(String(producto.id)===String(productoInfo.id)){
                return {...producto,cantidad:producto.cantidad+1};
            }
            return producto;
        });
    }else{
        itemsCarrito=[...itemsCarrito,productoInfo]
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

//sumar o restar cantidad de un item (si llega a 0 se elimina)
export function cambiarCantidad(evt){
    const boton=evt.target.closest('button');
    if(!boton) return;
    const id=boton.getAttribute('data-id');
    if(boton.classList.contains('mas')){
        evt.preventDefault();
        evt.stopPropagation();
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
    return itemsCarrito.reduce((acum,item)=>acum+item.precio*item.cantidad,0);
}
