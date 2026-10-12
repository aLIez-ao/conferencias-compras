// app: eventos y arranque
import { cargarCarrito, vaciarCarrito, eliminarProducto, cambiarCantidad, leerProducto } from './modelo-carrito.js';
import { cargarConferencias } from './datos-conferencias.js';
import { renderListaConferencias, renderDetalleConferencia } from './vista-conferencias.js';
import { obtenerCompra } from './pago.js';

document.addEventListener('DOMContentLoaded', async () => {
    const carrito = document.querySelector('#carrito'); // panel del carrito
    const vaciarCarritoB = document.querySelector('#vaciar-carrito'); // boton vaciar
    const botonCarrito = document.querySelector('#img-carrito'); // icono del carrito

    // Elementos del panel flotante de Ticket (TicketGen)
    const btnMenuTicketGen = document.getElementById('btn-menu-ticketgen');
    const panelTicketGen = document.getElementById('panel-ticketgen');
    const contenidoTicketGenMenu = document.getElementById('contenido-ticketgen-menu');

    registrarListener();
    cargarCarrito();
    await inicializarPagina();
    abrirPagoDesdeHash();

    // Registrar todos los eventos de la aplicación
    function registrarListener() {
        // Agregar producto al carrito desde cualquier listado o detalle
        document.addEventListener('click', agregarProducto);

        // Eliminar y cambiar cantidad dentro del panel
        if (carrito) {
            carrito.addEventListener('click', eliminarProducto);
            carrito.addEventListener('click', cambiarCantidad);
        }

        // Eliminar y cambiar cantidad en la página de detalle
        const detalle = document.querySelector('#lista-carrito-detalle');
        if (detalle) {
            detalle.addEventListener('click', eliminarProducto);
            detalle.addEventListener('click', cambiarCantidad);
        }

        // Abrir/cerrar carrito con click y cambiar color
        if (botonCarrito && carrito) {
            botonCarrito.addEventListener('click', (evt) => {
                evt.stopPropagation();
                // Si el ticket está abierto, lo cerramos
                if (panelTicketGen) panelTicketGen.classList.remove('activo');

                carrito.classList.toggle('activo');
                botonCarrito.classList.toggle('activo');
            });
        }

        // Control del botón y panel desplegable de TICKET en el Header
        if (btnMenuTicketGen && panelTicketGen) {
            btnMenuTicketGen.addEventListener('click', (evt) => {
                evt.stopPropagation();

                // Si el carrito está abierto, lo cerramos
                if (carrito) carrito.classList.remove('activo');
                if (botonCarrito) botonCarrito.classList.remove('activo');

                // Si se va a abrir el panel de ticket, cargamos la información del localStorage
                if (!panelTicketGen.classList.contains('activo')) {
                    cargarInfoTicketGenMenu();
                }

                panelTicketGen.classList.toggle('activo');
            });
        }

        // Cerrar paneles (carrito o ticket) al dar click fuera
        document.addEventListener('click', (evt) => {
            if (!evt.target.closest('.submenu')) {
                if (carrito) carrito.classList.remove('activo');
                if (botonCarrito) botonCarrito.classList.remove('activo');
            }
            if (!evt.target.closest('.submenu-ticketgen-container')) {
                if (panelTicketGen) panelTicketGen.classList.remove('activo');
            }
        });

        // Vaciar el carrito
        if (vaciarCarritoB) {
            vaciarCarritoB.addEventListener('click', vaciarCarrito);
        }

        // Integracion con pago: cuando se confirma una orden, el carrito se vacia
        document.addEventListener('ordenCreada', () => {
            vaciarCarrito();
        });
    }

    // Detectar click en "agregar al carrito" y leer el producto
    function agregarProducto(evt) {
        const boton = evt.target.closest('.agregar-carrito');
        if (boton) {
            evt.preventDefault();
            leerProducto(boton);
        }
    }

    // Cargar el JSON y dibujar la pagina actual (mosaico del index o detalle)
    async function inicializarPagina() {
        const grid = document.querySelector('#grid-conferencias');
        const detalle = document.querySelector('#detalle-conferencia');
        if (!grid && !detalle) return; //paginas sin conferencias (p. ej. carrito)

        try {
            await cargarConferencias();
        } catch (error) {
            console.error(error);
            const contenedor = grid || detalle;
            if (contenedor) {
                contenedor.innerHTML = `<p class="conferencia-vacia">No se pudieron cargar las conferencias.
                    Ejecuta el proyecto con un servidor local (por ejemplo Live Server).</p>`;
            }
            return;
        }

        if (grid) renderListaConferencias();
        if (detalle) {
            const id = new URLSearchParams(window.location.search).get('id');
            renderDetalleConferencia(id);
        }
    }

    // Si llegamos desde "Finalizar compra" (#pagar), abrimos el modal de pago
    function abrirPagoDesdeHash() {
        if (window.location.hash !== '#pagar') return;
        setTimeout(() => {
            const boton = document.querySelector('.btn-pagar, #pagar');
            if (boton) {
                boton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }, 0);
    }

    // Función para cargar los datos del ticket desde localStorage en el panel superior
    function cargarInfoTicketGenMenu() {
        if (!contenidoTicketGenMenu) return;

        // Obtenemos la compra guardada mediante la función de pago.js
        const compra = obtenerCompra();

        if (!compra) {
            contenidoTicketGenMenu.innerHTML = `
                <h4>Estado del Ticket</h4>
                <p>No tienes ningún ticket de compra registrado.</p>
            `;
            return;
        }

        let fechaLegible = compra.fechaFormateada || compra.fecha;
        try {
            const fechaObj = new Date(compra.fecha);
            if (!isNaN(fechaObj)) {
                fechaLegible = fechaObj.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
            }
        } catch (e) {}

        let listaItemsHtml = '';
        if (compra.items && compra.items.length > 0) {
            listaItemsHtml = '<ul style="padding-left: 15px; margin: 8px 0; font-size: 0.85rem;">';
            compra.items.forEach(item => {
                const nombreItem = item.nombre || 'Conferencia';
                const cantidadItem = item.cantidad || 1;
                const precioItem = typeof item.precio === 'number' ? `$${item.precio}` : item.precio;
                listaItemsHtml += `<li><strong>${cantidadItem}x</strong> ${nombreItem} (${precioItem})</li>`;
            });
            listaItemsHtml += '</ul>';
        }

        // Dibujamos el formato limpio del ticket dentro del panel flotante
        contenidoTicketGenMenu.innerHTML = `
            <h4>Ticket Generado</h4>
            <p><strong>Folio:</strong> ${compra.folio || 'N/D'}</p>
            <p><strong>Titular:</strong> ${compra.comprador?.nombre || 'Cliente'}</p>
            <p><strong>Fecha:</strong> ${fechaLegible}</p>
            <p style="margin-bottom: 4px;"><strong>Conferencias:</strong></p>
            ${listaItemsHtml}
            <hr style="margin: 8px 0; border: 0; border-top: 1px solid #E2E8F0;">
            <p style="text-align: right; font-size: 1rem; margin: 0;"><strong>Total:</strong> <span style="color: #C9A227;">${compra.total}</span></p>
        `;
    }
});
