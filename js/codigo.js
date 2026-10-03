const carrito=document.querySelector('#carrito');
const contenedorCarrito=document.querySelector('#lista-carrito tbody')
const vaciarCarritoB=document.querySelector('#vaciar-carrito')
const listaLibros=document.querySelector('#lista-libros')
let itemsCarrito=[];

registrarListener();
function registrarListener(){
    listaLibros.addEventListener('click',agregarLibro)

    //elimar libro
    carrito.addEventListener('click',eliminarLibro)

    //vaciar carrito
    vaciarCarritoB.addEventListener('click',()=>{
        itemsCarrito=[];
        HtmlCarrtio();
    })
}

//eliminar libro del carrito
function eliminarLibro(evt){
    evt.preventDefault()
    if(evt.target.classList.contains('borrar-curso')){
        const libroId=evt.target.getAttribute('data-id');
        itemsCarrito=itemsCarrito.filter(libro=>libro.id!==libroId)
        HtmlCarrtio();
    }
    
}

//funciones
function agregarLibro(evt){
    evt.preventDefault()
    if(evt.target.classList.contains('agregar-carrito')){
        const libroSeleccionado=evt.target.parentElement.parentElement;
        leerLibro(libroSeleccionado);
    }
    
}

//leer el contenido del libro
function leerLibro(libro){
    const libroInfo={
        imagen:libro.querySelector('img').src,
        nombre: libro.querySelector('h4').textContent,
        precio: libro.querySelector('.precio span').textContent,
        id: libro.querySelector('a').getAttribute('data-id'),
        cantidad: 1
    }

    const existe=itemsCarrito.some(libro=>libro.id===libroInfo.id);

    if(existe){
           const items=itemsCarrito.map(libro=>{
            if(libro.id==libroInfo.id){
                libro.cantidad++;
                return libro; //objeto actualiza
            }else{
                return libro; //objetos no duplicados
            }
           });
          itemsCarrito=[... items]  
    }else{
        itemsCarrito=[...itemsCarrito,libroInfo]
    }
    //Hacemos una copia y lo agregamos al carrito
    
    console.log(itemsCarrito)
    HtmlCarrtio();
}

//mostar el carrito de compra en HTML
function HtmlCarrtio(){

    //limpiar datos
    limpiarHTNL();

    itemsCarrito.forEach(libros=>{
        const {imagen,nombre,precio,cantidad,id}=libros;
        const fila=document.createElement('tr');
        fila.innerHTML=`
            <td>
                <img src="${imagen}" width="100">
            </td>
            <td>${nombre}</td>
            <td>${precio}</td>            
            <td>${cantidad}</td>
            <td>
                <a href="#" class="borrar-curso" data-id="${libros.id}">'x'</a>
            </td>            
        `;
        contenedorCarrito.appendChild(fila);
    });
}

function limpiarHTNL(){
    //contenedorCarrito.innerHTML='';
    while(contenedorCarrito.firstChild){
        contenedorCarrito.removeChild(contenedorCarrito.firstChild);
    }
}