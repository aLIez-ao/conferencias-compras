//vista: render del carrito y badge
const listaCarritoEl=document.querySelector('#lista-carrito');
const listaDetalleEl=document.querySelector('#lista-carrito-detalle');

function htmlCarrito(){
    const html=itemsCarrito.map(item=>{
        const {imagen,nombre,lugar,hora,precio,cantidad,id}=item;
        //excepcion: si cantidad es 1, el boton - se cambia por un bote de basura
        const botonMenos=cantidad===1
            ? `<button class="menos icono-basura" data-id="${id}" title="Eliminar"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>`
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
        badge.textContent=itemsCarrito.reduce((acum,item)=>acum+item.cantidad,0);
    }
}
