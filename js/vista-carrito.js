//vista: render del carrito y badge
import { itemsCarrito, totalCarrito } from './modelo-carrito.js';

const listaCarritoEl=document.querySelector('#lista-carrito'); //contenedor del panel
const listaDetalleEl=document.querySelector('#lista-carrito-detalle'); //contenedor de la pagina detalle

//generar el HTML de la lista y actualizar total y badge
export function htmlCarrito(){
    const html=itemsCarrito.map(item=>{
        const {imagen,nombre,lugar,hora,precio,cantidad,id}=item;
        //excepcion: si cantidad es 1, el boton - se cambia por un bote de basura
        const botonMenos = cantidad === 1
            ? `<button class="menos icono-basura" data-id="${id}" title="Eliminar"><img src="img/bote-basura.svg" alt="Eliminar"></button>`
            : `<button class="menos" data-id="${id}">-</button>`;
        return `
        <div class="item-carrito">
            <div class="item-producto">
                <img src="${imagen}" width="60">
                <h5>${nombre}</h5>
            </div>
            <div class="item-meta">
                ${lugar?`<span>${lugar}</span> · `:''}${hora?`<span>${hora}</span> · `:''}<span>$${precio}</span>
            </div>
            <div class="item-acciones">
                <div class="modificador">
                    ${botonMenos}
                    <span class="cantidad">${cantidad}</span>
                    <button class="mas" data-id="${id}">+</button>
                </div>
                <span class="item-total">$${precio*cantidad}</span>
            </div>
        </div>`;
    }).join('');

    if(listaCarritoEl) listaCarritoEl.innerHTML=html;
    if(listaDetalleEl) listaDetalleEl.innerHTML=html;

    const totalEl=document.querySelector('#total-carrito');
    if(totalEl) totalEl.textContent=`Total: $${totalCarrito()}`;
    const totalDetalle=document.querySelector('#total-detalle');
    if(totalDetalle) totalDetalle.textContent=`Total: $${totalCarrito()}`;

    const badge=document.querySelector('#badge-carrito');
    if(badge){
        const totalItems=itemsCarrito.reduce((acum,item)=>acum+item.cantidad,0);
        badge.textContent=totalItems;
        //sin notificacion si el carrito esta vacio
        badge.classList.toggle('oculto',totalItems===0);
    }
}
