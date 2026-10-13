//pago: logica de la pagina de checkout (pages/compra.html)
import { vaciarCarrito, obtenerCarrito, totalCarrito } from '../carrito/modelo-carrito.js';
import { rutaTicket } from '../conferencias/datos-conferencias.js';

let ultimaOrdenCreada = null; //ultima orden procesada (mientras dure la sesion)

const formatoMoneda = valor => valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

document.addEventListener('DOMContentLoaded', () => {
    const contenedorItems = document.getElementById('compra-items');
    const totalElem = document.getElementById('compra-total');
    const formPago = document.getElementById('form-pago');
    const mensajeEstado = document.getElementById('mensaje-pago-estado');
    const btnConfirmarPago = document.getElementById('btn-confirmar-pago');
    const radiosMetodo = document.querySelectorAll('input[name="metodo-pago"]');
    const seccionesMetodo = {
        tarjeta: document.getElementById('seccion-tarjeta'),
        paypal: document.getElementById('seccion-paypal'),
        transferencia: document.getElementById('seccion-transferencia')
    };

    renderResumen();

    //dibujar el resumen de la compra y bloquear el pago si el carrito esta vacio
    function renderResumen(){
        const items = obtenerCarrito();
        const total = totalCarrito();

        if(contenedorItems){
            contenedorItems.innerHTML = items.length
                ? items.map(item => `
                    <div class="compra-item">
                        <img src="${item.imagen}" alt="${item.nombre}">
                        <div class="compra-item-info">
                            <h4>${item.nombre}</h4>
                            <p>${item.lugar || ''}${item.hora ? ' · ' + item.hora : ''}</p>
                            <p class="compra-item-detalle">${item.cantidad} × ${formatoMoneda(Number(item.precio))}</p>
                        </div>
                        <span class="compra-item-subtotal">${formatoMoneda(Number(item.precio) * item.cantidad)}</span>
                    </div>`).join('')
                : '<p class="compra-vacia">Tu carrito está vacío. Agrega boletos para continuar.</p>';
        }

        if(totalElem) totalElem.textContent = `Total: ${formatoMoneda(total)}`;

        if(btnConfirmarPago){
            btnConfirmarPago.disabled = items.length === 0;
        }

        //si el carrito esta vacio, se oculta el pago y se ofrece volver al inicio
        const vacio = items.length === 0;
        document.getElementById('compra-pago-seccion')?.classList.toggle('hidden', vacio);
        document.getElementById('compra-vacio-seccion')?.classList.toggle('hidden', !vacio);
    }

    //cambiar entre pestañas de metodos de pago
    radiosMetodo.forEach(radio => {
        radio.addEventListener('change', evt => {
            const metodo = evt.target.value;
            Object.keys(seccionesMetodo).forEach(clave => {
                seccionesMetodo[clave]?.classList.toggle('activo', clave === metodo);
            });

            const esTarjeta = metodo === 'tarjeta';
            ['tarjeta-titular', 'tarjeta-numero', 'tarjeta-expira', 'tarjeta-cvv'].forEach(id => {
                const campo = document.getElementById(id);
                if(campo) campo.required = esTarjeta;
            });
        });
    });

    //procesar el formulario de pago
    formPago?.addEventListener('submit', evt => {
        evt.preventDefault();
        mensajeEstado?.classList.add('hidden');

        const items = obtenerCarrito();
        if(items.length === 0){
            mostrarMensaje('Tu carrito está vacío. Agrega boletos antes de pagar.', 'error');
            return;
        }

        const metodoSeleccionado = document.querySelector('input[name="metodo-pago"]:checked')?.value || 'tarjeta';

        if(metodoSeleccionado === 'tarjeta'){
            const numTarjeta = document.getElementById('tarjeta-numero')?.value.trim() || '';
            const expira = document.getElementById('tarjeta-expira')?.value.trim() || '';
            const cvv = document.getElementById('tarjeta-cvv')?.value.trim() || '';

            if(!/^\d{16}$/.test(numTarjeta)){
                mostrarMensaje('El número de tarjeta debe contener exactamente 16 dígitos.', 'error');
                return;
            }
            if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expira)){
                mostrarMensaje('La fecha de expiración debe tener el formato MM/AA (ej. 08/28).', 'error');
                return;
            }
            if(!/^\d{3,4}$/.test(cvv)){
                mostrarMensaje('El CVV debe contener 3 o 4 números.', 'error');
                return;
            }
        }

        if(btnConfirmarPago) btnConfirmarPago.disabled = true;
        mostrarMensaje('Procesando pago con la institución bancaria...', 'info');

        setTimeout(() => {
            if(btnConfirmarPago) btnConfirmarPago.disabled = false;

            const esExitoso = Math.random() < 0.9;
            if(!esExitoso){
                mostrarMensaje('Pago rechazado por el banco. Intenta de nuevo o cambia de método.', 'error');
                return;
            }

            const orden = construirOrden(metodoSeleccionado);
            ultimaOrdenCreada = orden;

            guardarOrdenEnHistorial(orden);
            localStorage.setItem('ultimaOrden', JSON.stringify(orden));
            vaciarCarrito();

            //redirigir a la pagina del ticket con el folio recien generado
            window.location.href = `${rutaTicket()}?folio=${encodeURIComponent(orden.folio)}`;
        }, 2200);
    });

    //armar el objeto de la orden a partir del carrito
    function construirOrden(metodo){
        const items = obtenerCarrito().map(item => ({
            id: item.id,
            nombre: item.nombre,
            lugar: item.lugar || '',
            hora: item.hora || '',
            precio: Number(item.precio) || 0,
            cantidad: Number(item.cantidad) || 1,
            subtotal: (Number(item.precio) || 0) * (Number(item.cantidad) || 1)
        }));
        const total = items.reduce((acum, item) => acum + item.subtotal, 0);

        return {
            id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'ORD-' + Date.now(),
            folio: 'FES-' + Math.floor(100000 + Math.random() * 900000),
            fecha: new Date().toISOString(),
            fechaFormateada: new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' }),
            items,
            total,
            totalTexto: formatoMoneda(total),
            metodoPago: metodo,
            comprador: {
                nombre: document.getElementById('tarjeta-titular')?.value.trim() || 'Cliente'
            }
        };
    }

    function guardarOrdenEnHistorial(nuevaOrden){
        const historial = JSON.parse(localStorage.getItem('historialOrdenes')) || [];
        historial.unshift(nuevaOrden);
        localStorage.setItem('historialOrdenes', JSON.stringify(historial));
    }

    function mostrarMensaje(texto, tipo){
        if(!mensajeEstado) return;
        mensajeEstado.textContent = texto;
        mensajeEstado.className = `mensaje-pago ${tipo}`;
    }
});

//ultima orden creada o la mas reciente del historial
export function obtenerCompra(){
    if(ultimaOrdenCreada) return ultimaOrdenCreada;
    const historial = JSON.parse(localStorage.getItem('historialOrdenes')) || [];
    return historial[0] || null;
}
