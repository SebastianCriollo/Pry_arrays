var btn_agregar = document.getElementById('btn_agregar');

var ul_lista_simple = document.getElementById('lista_productos');
var ul_lista_bootstrap = document.getElementById('lista_productos_mayuscula');

var productos = [];

btn_agregar.addEventListener('click', function () {
    var nombre_producto = document.getElementById('txt_producto');

    if (nombre_producto.value != '') {
        productos.unshift(nombre_producto.value);
        mostrarListados();
        nombre_producto.value = '';
    }
});

function mostrarListados() {

    ul_lista_simple.innerHTML = '';
    ul_lista_bootstrap.innerHTML = '';

    productos.forEach(function (producto) {
        let li = document.createElement('li');
        li.className = "list-group-item bg-dark text-white";
        li.textContent = producto.toLowerCase();
        ul_lista_simple.appendChild(li);
    });

    const items = productos.map(function (producto) {
        let li = document.createElement('li');
        li.className = "list-group-item bg-dark text-white";
        li.textContent = producto.toUpperCase();
        return li;
    });

    items.forEach(function (li) {
        ul_lista_bootstrap.appendChild(li);
    });
}
