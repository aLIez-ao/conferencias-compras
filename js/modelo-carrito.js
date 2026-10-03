//modelo: estado del carrito y persistencia
let itemsCarrito=[];

function guardarCarrito(){
    localStorage.setItem('carrito',JSON.stringify(itemsCarrito));
}

function cargarCarrito(){
    const datos=JSON.parse(localStorage.getItem('carrito'));
    if(datos){
        itemsCarrito=datos;
        htmlCarrito();
    }
}

function leerLibro(libro){
    const libroInfo={
        imagen:libro.querySelector('img').src,
        nombre: libro.querySelector('h4').textContent,
        lugar: libro.querySelector('[data-lugar]')?.textContent || libro.dataset?.lugar || '',
        hora: libro.querySelector('[data-hora]')?.textContent || libro.dataset?.hora || '',
        precio: Number(libro.querySelector('.precio span').textContent.replace('$','').trim()),
        id: libro.querySelector('a').getAttribute('data-id'),
        cantidad: 1
    }

    const existe=itemsCarrito.some(libro=>String(libro.id)===String(libroInfo.id));

    if(existe){
        itemsCarrito=itemsCarrito.map(libro=>{
            if(String(libro.id)===String(libroInfo.id)){
                return {...libro,cantidad:libro.cantidad+1};
            }
            return libro;
        });
    }else{
        itemsCarrito=[...itemsCarrito,libroInfo]
    }

    guardarCarrito();
    htmlCarrito();
}

function eliminarLibro(evt){
    evt.preventDefault()
    const boton=evt.target.closest('.borrar-curso');
    if(boton){
        const libroId=boton.getAttribute('data-id');
        itemsCarrito=itemsCarrito.filter(libro=>String(libro.id)!==String(libroId))
        guardarCarrito();
        htmlCarrito();
    }
}

function cambiarCantidad(evt){
    evt.preventDefault()
    const boton=evt.target.closest('button');
    if(!boton) return;
    const id=boton.getAttribute('data-id');
    if(boton.classList.contains('mas')){
        itemsCarrito=itemsCarrito.map(item=>String(item.id)===String(id)?{...item,cantidad:item.cantidad+1}:item);
    }else if(boton.classList.contains('menos')){
        itemsCarrito=itemsCarrito
            .map(item=>String(item.id)===String(id)?{...item,cantidad:item.cantidad-1}:item)
            .filter(item=>item.cantidad>0);
    }else{
        return;
    }
    guardarCarrito();
    htmlCarrito();
}

function vaciarCarrito(){
    itemsCarrito=[];
    guardarCarrito();
    htmlCarrito();
}

function totalCarrito(){
    return itemsCarrito.reduce((acum,item)=>acum+item.precio*item.cantidad,0);
}
