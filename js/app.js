//app: eventos y arranque
const carrito=document.querySelector('#carrito');
const vaciarCarritoB=document.querySelector('#vaciar-carrito')
const listaLibros=document.querySelector('#lista-libros')
const botonCarrito=document.querySelector('#img-carrito')

registrarListener();
cargarCarrito();

function registrarListener(){
    if(listaLibros) listaLibros.addEventListener('click',agregarLibro)

    if(carrito){
        carrito.addEventListener('click',eliminarLibro)
        carrito.addEventListener('click',cambiarCantidad)
    }

    const detalle=document.querySelector('#lista-carrito-detalle');
    if(detalle){
        detalle.addEventListener('click',eliminarLibro)
        detalle.addEventListener('click',cambiarCantidad)
    }

    //abrir/cerrar carrito con click y cambiar color
    if(botonCarrito && carrito){
        botonCarrito.addEventListener('click',()=>{
            carrito.classList.toggle('activo');
            botonCarrito.classList.toggle('activo');
        })
    }

    if(vaciarCarritoB){
        vaciarCarritoB.addEventListener('click',vaciarCarrito)
    }
}

function agregarLibro(evt){
    evt.preventDefault()
    const boton=evt.target.closest('.agregar-carrito');
    if(boton){
        leerLibro(boton.parentElement.parentElement);
    }
}
