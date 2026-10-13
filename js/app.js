//app: arranque de la pagina (carga datos, renderiza la vista y conecta eventos globales)
import { cargarCarrito, vaciarCarrito, eliminarProducto, cambiarCantidad, leerProducto } from './carrito/modelo-carrito.js';
import { cargarConferencias, rutaCompra } from './conferencias/datos-conferencias.js';
import { renderListaConferencias, renderDetalleConferencia } from './conferencias/vista-conferencias.js';

document.addEventListener('DOMContentLoaded', async () => {
    const carrito = document.querySelector('#carrito');
    const botonCarrito = document.querySelector('#img-carrito');
    const vaciarCarritoB = document.querySelector('#vaciar-carrito');

    registrarListener();
    cargarCarrito();
    await inicializarPagina();

    //conectar todos los eventos de la interfaz
    function registrarListener(){
        //agregar boletos al carrito desde cualquier tarjeta/boton
        document.addEventListener('click', agregarProducto);
        //comprar de inmediato: agrega y salta directo al checkout
        document.addEventListener('click', comprarAhora);

        //acciones del panel del carrito (cabecera)
        if(carrito){
            carrito.addEventListener('click', eliminarProducto);
            carrito.addEventListener('click', cambiarCantidad);
        }
        //acciones del detalle del carrito (pagina)
        const detalle = document.querySelector('#lista-carrito-detalle');
        if(detalle){
            detalle.addEventListener('click', eliminarProducto);
            detalle.addEventListener('click', cambiarCantidad);
        }

        //abrir/cerrar el panel del carrito
        if(botonCarrito && carrito){
            botonCarrito.addEventListener('click', evt => {
                evt.stopPropagation();
                carrito.classList.toggle('activo');
                botonCarrito.classList.toggle('activo');
            });
        }
        document.addEventListener('click', evt => {
            if(evt.target.closest('.submenu')) return;
            carrito?.classList.remove('activo');
            botonCarrito?.classList.remove('activo');
        });

        vaciarCarritoB?.addEventListener('click', evt => {
            evt.preventDefault();
            vaciarCarrito();
        });
    }

    //delegado: botones "Agregar al carrito"
    function agregarProducto(evt){
        const boton = evt.target.closest('.agregar-carrito');
        if(!boton) return;
        evt.preventDefault();
        leerProducto(boton);
    }

    //delegado: botones "Comprar ahora" -> agrega y va al checkout
    function comprarAhora(evt){
        const boton = evt.target.closest('.comprar-ahora');
        if(!boton) return;
        evt.preventDefault();
        leerProducto(boton);
        window.location.href = rutaCompra();
    }

    //render de la pagina segun lo que exista en el DOM
    async function inicializarPagina(){
        //solo se necesitan los datos del JSON en las paginas que muestran conferencias
        const hayGrid = document.querySelector('#grid-conferencias');
        const hayDetalle = document.querySelector('#detalle-conferencia');
        if(!hayGrid && !hayDetalle) return;

        try{
            await cargarConferencias();
        }catch(error){
            console.error(error);
            const contenedor = document.querySelector('#grid-conferencias') || document.querySelector('#detalle-conferencia');
            if(contenedor) contenedor.innerHTML = '<p class="error-datos">No se pudieron cargar las conferencias.</p>';
            return;
        }

        if(document.querySelector('#grid-conferencias')){
            renderListaConferencias();
        }

        if(document.querySelector('#detalle-conferencia')){
            const id = new URLSearchParams(window.location.search).get('id');
            renderDetalleConferencia(id);
        }
    }
});
