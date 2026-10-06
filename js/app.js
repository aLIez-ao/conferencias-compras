//app: eventos y arranque
const carrito=document.querySelector('#carrito'); //panel del carrito
const vaciarCarritoB=document.querySelector('#vaciar-carrito') //boton vaciar
const listaLibros=document.querySelector('#lista-libros') //contenedor de productos
const botonCarrito=document.querySelector('#img-carrito') //icono del carrito

registrarListener();
cargarCarrito();

//registrar todos los eventos de la aplicacion
function registrarListener(){
    //agregar producto al carrito desde el listado
    if(listaLibros) listaLibros.addEventListener('click',agregarLibro)

    //eliminar y cambiar cantidad dentro del panel
    if(carrito){
        carrito.addEventListener('click',eliminarLibro)
        carrito.addEventListener('click',cambiarCantidad)
    }

    //eliminar y cambiar cantidad en la pagina de detalle
    const detalle=document.querySelector('#lista-carrito-detalle');
    if(detalle){
        detalle.addEventListener('click',eliminarLibro)
        detalle.addEventListener('click',cambiarCantidad)
    }

    //abrir/cerrar carrito con click y cambiar color
    if(botonCarrito && carrito){
        botonCarrito.addEventListener('click',(evt)=>{
            evt.stopPropagation();
            carrito.classList.toggle('activo');
            botonCarrito.classList.toggle('activo');
        })

        //cerrar el carrito al dar click fuera
        document.addEventListener('click',(evt)=>{
            if(!evt.target.closest('.submenu')){
                carrito.classList.remove('activo');
                botonCarrito.classList.remove('activo');
            }
        })
    }

    //vaciar el carrito
    if(vaciarCarritoB){
        vaciarCarritoB.addEventListener('click',vaciarCarrito)
    }
}

//detectar click en "agregar al carrito" y leer el producto
function agregarLibro(evt){
    const boton=evt.target.closest('.agregar-carrito');
    if(boton){
        evt.preventDefault();
        leerLibro(boton.parentElement.parentElement);
    }
}
