import { vaciarCarrito, cargarCarrito, obtenerCarrito } from './modelo-carrito.js';

let ultimaOrdenCreada = null;

document.addEventListener('DOMContentLoaded', () => {
  const modalPago = document.getElementById('modal-pago');
  const modalConfirmacion = document.getElementById('modal-confirmacion');
  const cerrarModalPagoBtn = document.getElementById('cerrar-modal-pago');
  const formPago = document.getElementById('form-pago');
  const montoTotalElem = document.getElementById('pago-monto-total');
  const mensajeEstado = document.getElementById('mensaje-pago-estado');
  const btnConfirmarPago = document.getElementById('btn-confirmar-pago');

  const radiosMetodo = document.querySelectorAll('input[name="metodo-pago"]');
  const seccionesMetodo = {
    tarjeta: document.getElementById('seccion-tarjeta'),
    paypal: document.getElementById('seccion-paypal'),
    transferencia: document.getElementById('seccion-transferencia')
  };

  // Función principal para abrir el modal de pago
  function abrirModalPago(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const totalTexto = obtenerTotalCarrito();
    if (!totalTexto || totalTexto === '$0' || totalTexto === '$0.00' || totalTexto === '$0.00 MXN') {
      alert('Tu carrito está vacío. Agrega boletos antes de pagar.');
      return;
    }

    if (montoTotalElem) montoTotalElem.textContent = totalTexto;
    limpiarFormulario();

    if (modalPago) {
      modalPago.showModal();
    } else {
      console.error('No se encontró el elemento <dialog id="modal-pago"> en el HTML.');
    }
  }

  // Asignar evento directamente a los botones de pago si existen en el DOM
  const btnPagar = document.getElementById('btn-pagar-carrito') || document.getElementById('pagar');
  if (btnPagar) {
    btnPagar.addEventListener('click', abrirModalPago);
  }

  // Delegación global de respaldo para detectar clics en cualquier botón de pago
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && (t.id === 'btn-pagar-carrito' || t.id === 'pagar' || t.textContent.trim().toUpperCase() === 'PAGAR')) {
      abrirModalPago(e);
    }
  });

  // Cerrar Modal
  cerrarModalPagoBtn?.addEventListener('click', () => modalPago?.close());

  // Cambiar entre pestañas de métodos de pago
  radiosMetodo.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const metodo = e.target.value;
      Object.keys(seccionesMetodo).forEach(key => {
        if (seccionesMetodo[key]) {
          seccionesMetodo[key].classList.toggle('activo', key === metodo);
        }
      });

      const esTarjeta = metodo === 'tarjeta';
      if (document.getElementById('tarjeta-titular')) document.getElementById('tarjeta-titular').required = esTarjeta;
      if (document.getElementById('tarjeta-numero')) document.getElementById('tarjeta-numero').required = esTarjeta;
      if (document.getElementById('tarjeta-expira')) document.getElementById('tarjeta-expira').required = esTarjeta;
      if (document.getElementById('tarjeta-cvv')) document.getElementById('tarjeta-cvv').required = esTarjeta;
    });
  });

  // Procesar Formulario de Pago
  formPago?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (mensajeEstado) mensajeEstado.classList.add('hidden');
    
    const metodoSeleccionado = document.querySelector('input[name="metodo-pago"]:checked')?.value || 'tarjeta';

    if (metodoSeleccionado === 'tarjeta') {
      const numTarjeta = document.getElementById('tarjeta-numero')?.value.trim() || '';
      const expira = document.getElementById('tarjeta-expira')?.value.trim() || '';
      const cvv = document.getElementById('tarjeta-cvv')?.value.trim() || '';

      if (!/^\d{16}$/.test(numTarjeta)) {
        mostrarMensaje('El número de tarjeta debe contener exactamente 16 dígitos.', 'error');
        return;
      }

      
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expira)) {
        mostrarMensaje('La fecha de expiración debe tener el formato MM/AA (ej. 08/28).','error');
        return;
     }


      if (!/^\d{3,4}$/.test(cvv)) {
        mostrarMensaje('El CVV debe contener 3 o 4 números.', 'error');
        return;
      }
    }

    if (btnConfirmarPago) btnConfirmarPago.disabled = true;
    mostrarMensaje('Procesando pago con la institución bancaria...', 'info');

    setTimeout(() => {
      if (btnConfirmarPago) btnConfirmarPago.disabled = false;

      const esExitoso = Math.random() < 0.9;

      if (esExitoso) {
        const itemsComprados = typeof obtenerCarrito === 'function' ? obtenerCarrito() : [];
        const montoFinal = montoTotalElem ? montoTotalElem.textContent : '$0.00';

        const orden = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'ORD-' + Date.now(),
          folio: 'FES-' + Math.floor(100000 + Math.random() * 900000),
          fecha: new Date().toISOString(),
          fechaFormateada: new Date().toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }),
          items: itemsComprados,
          total: montoFinal,
          metodoPago: metodoSeleccionado,
          comprador: {
            nombre: document.getElementById('tarjeta-titular')?.value.trim() || 'Cliente'
          }
        };

        ultimaOrdenCreada = orden;
        guardarOrdenEnHistorial(orden);
        vaciarCarrito();

        modalPago?.close();

        document.dispatchEvent(new CustomEvent('ordenCreada', { detail: orden }));

        if (document.getElementById('orden-folio')) {
          document.getElementById('orden-folio').textContent = orden.folio;
        }

        if (document.getElementById('orden-monto')) {
          document.getElementById('orden-monto').textContent = orden.total;
        }
        modalConfirmacion?.showModal();

      } else {
        mostrarMensaje('Pago rechazado por el banco. Por favor intenta de nuevo o cambia de tarjeta.', 'error');
      }
    }, 2500);
  });

  document.getElementById('btn-cerrar-confirmacion')?.addEventListener('click', () => {
    modalConfirmacion?.close();
    if (typeof cargarCarrito === 'function') {
      cargarCarrito();
    }
  });

  function guardarOrdenEnHistorial(nuevaOrden) {
    const historial = JSON.parse(localStorage.getItem('historialOrdenes')) || [];
    historial.unshift(nuevaOrden);
    localStorage.setItem('historialOrdenes', JSON.stringify(historial));
  }

  function mostrarMensaje(texto, tipo) {
    if (mensajeEstado) {
      mensajeEstado.textContent = texto;
      mensajeEstado.className = `mensaje-pago ${tipo}`;
    }
  }

  function limpiarFormulario() {
    if (formPago) formPago.reset();
    if (mensajeEstado) mensajeEstado.classList.add('hidden');
    if (btnConfirmarPago) btnConfirmarPago.disabled = false;
    if (radiosMetodo[0]) {
      radiosMetodo[0].checked = true;
      radiosMetodo[0].dispatchEvent(new Event('change'));
    }
  }

  function obtenerTotalCarrito() {
    const elementoTotal = document.querySelector('.total-carrito, #total-carrito, #total');
    if (elementoTotal) {
      return elementoTotal.textContent.replace('Total:', '').trim();
    }

    const carritoPanel = document.querySelector('#carrito');
    if (carritoPanel) {
      const elementos = carritoPanel.querySelectorAll('p, span, div, h4');
      for (const el of elementos) {
        if (el.textContent.includes('Total:')) {
          return el.textContent.replace('Total:', '').trim();
        }
      }
    }

    return '$0.00';
  }
});

export function obtenerCompra() {
  if (ultimaOrdenCreada) {
    return ultimaOrdenCreada;
  }
  const historial = JSON.parse(localStorage.getItem('historialOrdenes')) || [];
  return historial[0] || null;
}