//datos: carga el JSON de conferencias y resuelve rutas de recursos/paginas
const RAIZ = new URL('../../', import.meta.url); //carpeta raiz del proyecto (dos niveles arriba de /js/conferencias/)
const RUTA_JSON = new URL('data/conferencias.json', RAIZ).href;
const enPaginas = /\/pages\//.test(window.location.pathname.replace(/\\/g, '/')); //true si estamos dentro de /pages/

let conferencias = []; //cache en memoria

//cargar el JSON (una sola vez) y devolver el arreglo
export async function cargarConferencias(){
    if(conferencias.length) return conferencias;
    const respuesta = await fetch(RUTA_JSON);
    if(!respuesta.ok) throw new Error(`No se pudo cargar ${RUTA_JSON} (${respuesta.status})`);
    conferencias = await respuesta.json();
    return conferencias;
}

//todas las conferencias cargadas
export function obtenerConferencias(){
    return conferencias;
}

//una conferencia por id (acepta string o numero)
export function obtenerConferencia(id){
    return conferencias.find(conf => String(conf.id) === String(id)) || null;
}

//ruta absoluta de una imagen del JSON (independiente de la pagina actual)
export function rutaImagen(nombre){
    return new URL(`img/${nombre}`, RAIZ).href;
}

//ruta a la pagina de detalle de una conferencia
export function rutaDetalle(id){
    return `${enPaginas ? '' : 'pages/'}conferencia.html?id=${id}`;
}

//ruta al index
export function rutaInicio(){
    return enPaginas ? '../index.html' : 'index.html';
}

//ruta a la pagina del carrito
export function rutaCarrito(){
    return enPaginas ? 'carrito.html' : 'pages/carrito.html';
}

//ruta a la pagina de compra (checkout)
export function rutaCompra(){
    return enPaginas ? 'compra.html' : 'pages/compra.html';
}

//ruta a la pagina del ticket
export function rutaTicket(){
    return enPaginas ? 'ticket.html' : 'pages/ticket.html';
}
