/**
 * Test de simulación de compra y exportación a JSON.
 * Captura la información del modal de confirmación cuando la compra es exitosa.
 */

document.addEventListener('DOMContentLoaded', () => {
  const modalConfirmacion = document.getElementById('modal-confirmacion');
  if (!modalConfirmacion) return;

  // Observador para detectar cuándo se abre el modal de confirmación tras un pago exitoso
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'open' && modalConfirmacion.hasAttribute('open')) {
        generarYDescargarJSON();
      }
    });
  });

  observer.observe(modalConfirmacion, { attributes: true });
});

/**
 * Recopila los datos de la transacción desde el DOM y localStorage para descargar el JSON
 */
function generarYDescargarJSON() {
  // Recalcular o extraer ítems guardados en localStorage antes del vaciado
  const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];

  const metodoSeleccionado = document.querySelector('input[name="metodo-pago"]:checked')?.value || 'desconocido';
  const titular = document.getElementById('tarjeta-titular')?.value.trim() || 'Cliente';

  const ordenJSON = {
    id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'ORD-' + Date.now(),
    folio: document.getElementById('orden-folio')?.textContent || 'FES-000000',
    total: document.getElementById('orden-monto')?.textContent || '$0.00',
    fecha: new Date().toISOString(),
    metodoPago: metodoSeleccionado,
    comprador: {
      nombre: titular
    },
    items: carritoGuardado
  };

  console.log('✅ Compra detectada. Generando archivo JSON...', ordenJSON);

  // Crear Blob y forzar la descarga en el navegador
  const blob = new Blob([JSON.stringify(ordenJSON, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = `orden_${ordenJSON.folio}.json`;
  document.body.appendChild(a);
  a.click();

  // Limpieza
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}