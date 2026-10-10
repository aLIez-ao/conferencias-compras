import { vaciarCarrito, cargarCarrito } from './modelo-carrito.js';

document.addEventListener('DOMContentLoaded', () => {
  // Elementos HTML del Modal de Pago
const modalPago = document.getElementById('modal-pago');
const modalConfirmacion = document.getElementById('modal-confirmacion');
const cerrarModalPagoBtn = document.getElementById('cerrar-modal-pago');
const formPago = document.getElementById('form-pago');
const montoTotalElem = document.getElementById('pago-monto-total');
const mensajeEstado = document.getElementById('mensaje-pago-estado');
const btnConfirmarPago = document.getElementById('btn-confirmar-pago');

  // Radios / Métodos
const radiosMetodo = document.querySelectorAll('input[name="metodo-pago"]');
const seccionesMetodo = {
    tarjeta: document.getElementById('seccion-tarjeta'),
    paypal: document.getElementById('seccion-paypal'),
    transferencia: document.getElementById('seccion-transferencia')
};

  // Abrir Modal de Pago al dar click en el botón "PAGAR" dentro del Carrito
document.addEventListener('click', (e) => {
    // Detectar el botón pagar de tu panel de carrito
    if (e.target && (e.target.id === 'btn-pagar-carrito' || e.target.textContent.trim().toUpperCase() === 'PAGAR')) {
    e.preventDefault();
    const totalTexto = obtenerTotalCarrito();
    if (!totalTexto || totalTexto === '$0' || totalTexto === '$0.00') {
    alert('Tu carrito está vacío. Agrega boletos antes de pagar.');
    return;
    }

montoTotalElem.textContent = totalTexto;
limpiarFormulario();
modalPago.showModal();
    }
});

  // Cerrar Modal
cerrarModalPagoBtn?.addEventListener('click', () => modalPago.close());

  // Cambiar entre pestañas de métodos de pago
radiosMetodo.forEach(radio => {
    radio.addEventListener('change', (e) => {
    const metodo = e.target.value;
    Object.keys(seccionesMetodo).forEach(key => {
        if (seccionesMetodo[key]) {
        seccionesMetodo[key].classList.toggle('activo', key === metodo);
        }
    });

      // Alternar campos 'required' según método elegido
    const esTarjeta = metodo === 'tarjeta';
    document.getElementById('tarjeta-titular').required = esTarjeta;
    document.getElementById('tarjeta-numero').required = esTarjeta;
    document.getElementById('tarjeta-expira').required = esTarjeta;
    document.getElementById('tarjeta-cvv').required = esTarjeta;
    });
});

  // Procesar Formulario de Pago
formPago.addEventListener('submit', (e) => {
    e.preventDefault();
    mensajeEstado.classList.add('hidden');

    const metodoSeleccionado = document.querySelector('input[name="metodo-pago"]:checked').value;

    // Validaciones extra si el método es tarjeta
    if (metodoSeleccionado === 'tarjeta') {
    const numTarjeta = document.getElementById('tarjeta-numero').value.trim();
    const expira = document.getElementById('tarjeta-expira').value.trim();
    const cvv = document.getElementById('tarjeta-cvv').value.trim();

    if (!/^\d{16}$/.test(numTarjeta)) {
        mostrarMensaje('El número de tarjeta debe contener exactamente 16 dígitos.', 'error');
        return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expira)) {
        mostrarMensaje('La fecha de expiración debe tener el formato MM/AA (ej. 08/28).', 'error');
        return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        mostrarMensaje('El CVV debe contener 3 o 4 números.', 'error');
        return;
    }
    }

    // Estado: Procesando
    btnConfirmarPago.disabled = true;
    mostrarMensaje('Procesando pago con la institución bancaria...', 'info');

    // Simular llamada de red/servidor (2.5 segundos)
    setTimeout(() => {
    btnConfirmarPago.disabled = false;

    // Simulación de tasa de éxito (90% éxito, 10% rechazo para pruebas)
    const esExitoso = Math.random() < 0.9;

    if (esExitoso) {
        // 1. Cerrar modal de pago
        modalPago.close();

        // 2. Generar Folio aleatorio
        const folio = 'FES-' + Math.floor(100000 + Math.random() * 900000);
        const montoFinal = montoTotalElem.textContent;

        // 3. Vaciar Carrito en datos y pantalla
        vaciarCarrito();

        // 4. Mostrar Modal de Confirmación
        document.getElementById('orden-folio').textContent = folio;
        document.getElementById('orden-monto').textContent = montoFinal;
        modalConfirmacion.showModal();

    } else {
        // Pago rechazado simulado
        mostrarMensaje('Pago rechazado por el banco. Por favor intenta de nuevo o cambia de tarjeta.', 'error');
    }
    }, 2500);
});

  // Cerrar confirmación y reiniciar vista completa
document.getElementById('btn-cerrar-confirmacion')?.addEventListener('click', () => {
    modalConfirmacion.close();
    // Refrescar estado o recargar la página si se prefiere
    if (typeof cargarCarrito === 'function') {
    cargarCarrito();
    }
});

  // Auxiliares
function mostrarMensaje(texto, tipo) {
    mensajeEstado.textContent = texto;
    mensajeEstado.className = `mensaje-pago ${tipo}`;
}

function limpiarFormulario() {
    formPago.reset();
    mensajeEstado.classList.add('hidden');
    btnConfirmarPago.disabled = false;
    // Seleccionar tarjeta por defecto
    radiosMetodo[0].checked = true;
    radiosMetodo[0].dispatchEvent(new Event('change'));
}

function obtenerTotalCarrito() {
    // Busca el nodo del total generado en la vista del carrito
    const elementoTotal = document.querySelector('.total-carrito, #total-carrito, #total');
    if (elementoTotal) {
    return elementoTotal.textContent.replace('Total:', '').trim();
    }
    return '$0.00';
}
});