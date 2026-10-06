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

//leer los datos de un producto y agregarlo (o sumar cantidad si ya existe)
export function leerProducto(producto){
    const productoInfo={
        imagen:producto.querySelector('img').src,
        nombre: producto.querySelector('h4').textContent,
        lugar: producto.querySelector('[data-lugar]')?.textContent || producto.dataset?.lugar || '',
        hora: producto.querySelector('[data-hora]')?.textContent || producto.dataset?.hora || '',
        precio: Number(producto.querySelector('.precio span').textContent.replace('$','').trim()),
        id: producto.querySelector('a').getAttribute('data-id'),
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
