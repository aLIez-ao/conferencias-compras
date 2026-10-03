//modelo: estado del carrito y persistencia
let itemsCarrito=[]; //lista de items del carrito

//guardar el carrito en localStorage
function guardarCarrito(){
    localStorage.setItem('carrito',JSON.stringify(itemsCarrito));
}

//cargar el carrito desde localStorage al iniciar
function cargarCarrito(){
    const datos=JSON.parse(localStorage.getItem('carrito'));
    if(datos){
        itemsCarrito=datos;
        htmlCarrito();
    }
}

//leer los datos de un producto y agregarlo (o sumar cantidad si ya existe)
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

    //si ya existe solo se aumenta la cantidad
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

//eliminar un item del carrito por su id
function eliminarLibro(evt){
    const boton=evt.target.closest('.borrar-curso');
    if(boton){
        evt.preventDefault();
        evt.stopPropagation();
        const libroId=boton.getAttribute('data-id');
        itemsCarrito=itemsCarrito.filter(libro=>String(libro.id)!==String(libroId))
        guardarCarrito();
        htmlCarrito();
    }
}

//sumar o restar cantidad de un item (si llega a 0 se elimina)
function cambiarCantidad(evt){
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
function vaciarCarrito(){
    itemsCarrito=[];
    guardarCarrito();
    htmlCarrito();
}

//calcular el total a pagar
function totalCarrito(){
    return itemsCarrito.reduce((acum,item)=>acum+item.precio*item.cantidad,0);
}
