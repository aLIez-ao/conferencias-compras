//ticket: render del comprobante, codigo QR y descarga en PDF (pages/ticket.html)
//depende de las librerias globales: qrcode (qrcode.min.js) y jspdf.jsPDF (jspdf.min.js)

const ETIQUETA_METODO = {
    tarjeta: 'Tarjeta de crédito / débito',
    paypal: 'PayPal',
    transferencia: 'Transferencia SPEI'
};

const formatoMoneda = valor => Number(valor).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

//codificar/decodificar texto en base64 apto para URL (utf-8 seguro)
function aBase64Url(texto){
    return btoa(unescape(encodeURIComponent(texto)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function desdeBase64Url(texto){
    const b64 = texto.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(escape(atob(b64)));
}

//generar el QR como PNG (canvas) para usarlo en la pagina y en el PDF
function qrPNG(texto){
    const qr = qrcode(0, 'M');
    qr.addData(texto);
    qr.make();

    const modulos = qr.getModuleCount();
    const escala = 8;
    const margen = 4;
    const tam = (modulos + margen * 2) * escala;

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = tam;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tam, tam);
    ctx.fillStyle = '#000000';
    for(let fila = 0; fila < modulos; fila++){
        for(let col = 0; col < modulos; col++){
            if(qr.isDark(fila, col)){
                ctx.fillRect((col + margen) * escala, (fila + margen) * escala, escala, escala);
            }
        }
    }
    return canvas.toDataURL('image/png');
}

//normalizar una orden (venga de localStorage o de la URL) a la forma que usa el ticket
function normalizarOrden(orden){
    const items = (orden.items || []).map(item => ({
        nombre: item.nombre || 'Conferencia',
        cantidad: Number(item.cantidad) || 1,
        subtotal: Number(item.subtotal) || (Number(item.precio) || 0) * (Number(item.cantidad) || 1)
    }));
    const total = Number(orden.total) || items.reduce((acum, item) => acum + item.subtotal, 0);

    return {
        folio: orden.folio || 'FES-000000',
        fechaFormateada: orden.fechaFormateada || new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' }),
        comprador: orden.comprador?.nombre || 'Cliente',
        metodoPago: ETIQUETA_METODO[orden.metodoPago] || orden.metodoPago || 'Tarjeta',
        total,
        items
    };
}

//buscar la orden: primero por ?data (QR escaneado), luego por ?folio o la mas reciente
function obtenerOrden(){
    const params = new URLSearchParams(window.location.search);

    const data = params.get('data');
    if(data){
        try{
            return normalizarOrden(JSON.parse(desdeBase64Url(data)));
        }catch(error){
            console.error('No se pudo leer el ticket del QR:', error);
        }
    }

    const folio = params.get('folio');
    const historial = JSON.parse(localStorage.getItem('historialOrdenes')) || [];
    const encontrada = folio ? historial.find(orden => orden.folio === folio) : historial[0];
    return encontrada ? normalizarOrden(encontrada) : null;
}

document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenido-ticket');
    if(!contenedor) return;

    const orden = obtenerOrden();
    if(!orden){
        contenedor.innerHTML = `
            <div class="ticket-vacio">
                <h2>No tienes tickets todavía</h2>
                <p>Cuando completes una compra, aquí aparecerá tu comprobante con su código QR.</p>
                <a href="../index.html#lista-conferencias" class="button btn-finalizar">Ver conferencias</a>
            </div>`;
        document.getElementById('btn-descargar-pdf')?.setAttribute('disabled', 'disabled');
        document.getElementById('btn-imprimir-ticket')?.setAttribute('disabled', 'disabled');
        return;
    }

    //el QR codifica una URL con los datos embebidos: al escanear se abre el ticket con su informacion
    const paginaTicket = new URL('ticket.html', window.location.href).href;
    const payload = aBase64Url(JSON.stringify({
        folio: orden.folio,
        fechaFormateada: orden.fechaFormateada,
        comprador: orden.comprador,
        metodoPago: orden.metodoPago,
        total: orden.total,
        items: orden.items
    }));
    const contenidoQR = `${paginaTicket}?data=${payload}`;
    const qrImagen = qrPNG(contenidoQR);

    contenedor.innerHTML = `
        <article class="ticket">
            <header class="ticket-cabecera">
                <div class="ticket-marca"><img src="../img/icon.png" alt="Conferencify" class="logo-icono"> Conferencify</div>
                <span class="ticket-estado">Pagado</span>
            </header>

            <div class="ticket-cuerpo">
                <div class="ticket-info">
                    <p class="ticket-folio">Folio <strong>${orden.folio}</strong></p>
                    <dl class="ticket-campos">
                        <div><dt>Cliente</dt><dd>${orden.comprador}</dd></div>
                        <div><dt>Fecha de compra</dt><dd>${orden.fechaFormateada}</dd></div>
                        <div><dt>Método de pago</dt><dd>${orden.metodoPago}</dd></div>
                    </dl>

                    <ul class="ticket-items">
                        ${orden.items.map(item => `
                            <li>
                                <span class="ticket-item-nombre">${item.nombre}</span>
                                <span class="ticket-item-cantidad">x${item.cantidad}</span>
                                <span class="ticket-item-subtotal">${formatoMoneda(item.subtotal)}</span>
                            </li>`).join('')}
                    </ul>

                    <p class="ticket-total">Total pagado: <strong>${formatoMoneda(orden.total)}</strong></p>
                </div>

                <div class="ticket-qr">
                    <img src="${qrImagen}" alt="Código QR del ticket">
                    <p class="ticket-qr-texto">Escanea para consultar los datos del ticket</p>
                </div>
            </div>

            <footer class="ticket-pie">Presenta este código QR en el acceso al evento.</footer>
        </article>`;

    document.getElementById('btn-imprimir-ticket')?.addEventListener('click', () => window.print());
    document.getElementById('btn-descargar-pdf')?.addEventListener('click', () => descargarPDF(orden, qrImagen));
});

//generar el PDF del ticket con jsPDF
function descargarPDF(orden, qrImagen){
    if(!window.jspdf || !window.jspdf.jsPDF){
        alert('No se pudo cargar el generador de PDF.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const margen = 14;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Conferencify', margen, y);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante de compra', margen, y + 7);

    doc.setDrawColor(180);
    doc.line(margen, y + 11, 134, y + 11);
    y += 20;

    doc.setFontSize(10);
    const campos = [
        ['Folio', orden.folio],
        ['Cliente', orden.comprador],
        ['Fecha', orden.fechaFormateada],
        ['Método de pago', orden.metodoPago]
    ];
    campos.forEach(([etiqueta, valor]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${etiqueta}:`, margen, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(valor), margen + 32, y);
        y += 6;
    });

    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Boletos', margen, y);
    doc.setFont('helvetica', 'normal');
    y += 6;

    orden.items.forEach(item => {
        doc.text(`${item.cantidad}x ${item.nombre}`, margen, y);
        doc.text(formatoMoneda(item.subtotal), 134, y, { align: 'right' });
        y += 6;
    });

    y += 2;
    doc.setDrawColor(180);
    doc.line(margen, y, 134, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total pagado:', margen, y);
    doc.text(formatoMoneda(orden.total), 134, y, { align: 'right' });

    //codigo QR en la esquina inferior derecha
    const qrTam = 42;
    doc.addImage(qrImagen, 'PNG', 148 - margen - qrTam, y - 40, qrTam, qrTam);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Presenta este código QR en el acceso al evento.', margen, 200);

    doc.save(`ticket-${orden.folio}.pdf`);
}
