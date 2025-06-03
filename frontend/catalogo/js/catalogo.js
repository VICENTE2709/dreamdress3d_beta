// ✅ MOVER AL PRINCIPIO: ahora es global
function obtenerCarrito() {
     return JSON.parse(localStorage.getItem('carrito')) || [];
   }
   
   function actualizarCarritoVisible() {
     const carrito = obtenerCarrito();
     const tbody = document.querySelector('#lista-carrito tbody');
     tbody.innerHTML = ''; // limpiar antes de pintar
   
     carrito.forEach(producto => {
       const fila = document.createElement('tr');
       fila.innerHTML = `
         <td><img src="${producto.Imagen}" width="50"></td>
         <td>${producto.Nombre}</td>
         <td>${producto.Precio} Bs</td>
         <td>${producto.Cantidad}</td>
         <td><a href="#" class="eliminar-producto" data-id="${producto.ProductoID}">X</a></td>
       `;
       tbody.appendChild(fila);
     });
   }
   
   function agregarAlCarrito(producto) {
     const carrito = obtenerCarrito();
     const existente = carrito.find(p => p.ProductoID == producto.ProductoID);
   
     if (existente) {
       existente.Cantidad += 1;
     } else {
       carrito.push({ ...producto, Cantidad: 1 });
     }
   
     localStorage.setItem('carrito', JSON.stringify(carrito));
     actualizarCarritoVisible(); // actualizar tabla visible
     alert(`${producto.Nombre} agregado al carrito ✅`);
   }
   
   function eliminarDelCarrito(id) {
     let carrito = obtenerCarrito();
     carrito = carrito.filter(p => p.ProductoID != id);
     localStorage.setItem('carrito', JSON.stringify(carrito));
     actualizarCarritoVisible();
   }
   
   // ✅ Al cargar página: mostrar carrito
   document.addEventListener('DOMContentLoaded', () => {
     const listaCursos = document.querySelector('#lista-cursos');
   
     fetch('http://dreamdressv1.test/dreamdressv1/backend/api/productos_api.php')
       .then(res => res.json())
       .then(productos => {
         productos.forEach(producto => {
           const card = document.createElement('div');
           card.classList.add('card');
   
           card.innerHTML = `
             <img src="${producto.Imagen}" alt="${producto.Nombre}">
             <h4>${producto.Nombre}</h4>
             <p>${producto.Descripcion}</p>
             <span class="precio">${producto.Precio} Bs</span>
             <a href="#" class="agregar-carrito" data-id="${producto.ProductoID}">Agregar al carrito</a>
           `;
   
           listaCursos.appendChild(card);
         });
   
         // Delegar click agregar al carrito
         listaCursos.addEventListener('click', (e) => {
           if (e.target.classList.contains('agregar-carrito')) {
             const id = e.target.getAttribute('data-id');
             const producto = productos.find(p => p.ProductoID == id);
             agregarAlCarrito(producto);
           }
         });
       })
       .catch(err => console.error('Error cargando productos:', err));
   
     actualizarCarritoVisible(); // 👉 ya funciona porque obtenerCarrito es global
   });
   
   // Listener para eliminar productos del carrito
   document.querySelector('#lista-carrito tbody').addEventListener('click', (e) => {
     if (e.target.classList.contains('eliminar-producto')) {
       const id = e.target.getAttribute('data-id');
       eliminarDelCarrito(id);
     }
   });

   document.getElementById('vaciar-carrito').addEventListener('click', (e) => {
     e.preventDefault();
     localStorage.removeItem('carrito'); // vacía storage
     fetch('http://dreamdressv1.test/dreamdressv1/backend/api/vaciar_carrito_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: localStorage.getItem('usuario_id') })
    });
     actualizarCarritoVisible(); // actualiza tabla vacía
     alert('Carrito vaciado.');
   });

   
   document.getElementById('comprar').addEventListener('click', (e) => {
    e.preventDefault();
  
    const carrito = obtenerCarrito();
    const usuario_id = localStorage.getItem('usuario_id');
    const token = localStorage.getItem('token');
  
    if (!usuario_id || !token) {
      alert("Debes iniciar sesión.");
      window.location.href = "/login.html";
      return;
    }
  
    if (carrito.length === 0) {
      alert('El carrito está vacío. Agrega productos antes de comprar.');
      return;
    }
  
    // Verificación de sesión
    fetch('http://dreamdressv1.test/dreamdressv1/backend/api/verificar_sesion_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id, token })
    })
    .then(async res => {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        return data;
      } catch (e) {
        console.error("❌ La respuesta no fue JSON:", text);
        throw new Error("Respuesta inválida del servidor.");
      }
    })
    .then(data => {
      if (data.status === 'success') {
        continuarCompra(carrito, usuario_id);
      } else {
        alert('Debes iniciar sesión nuevamente.');
        localStorage.clear(); // buena práctica
        window.location.href = '/login.html';
      }
    })
    .catch(err => {
      console.error('❌ Error al verificar sesión:', err);
      alert('Error de verificación de sesión.');
    });
  });
  
  // Lógica para guardar el carrito en BD
  function continuarCompra(carrito, usuario_id) {
    fetch('http://dreamdressv1.test/dreamdressv1/backend/api/guardar_carrito_api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuario_id: usuario_id,
        productos: carrito
      })
    })
    .then(async res => {
      if (!res.ok) throw new Error("Error de red");
      const data = await res.json();
  
      if (data.status === 'success') {
        // Opcional: guardar carrito_id
        localStorage.setItem('carrito_id', data.carrito_id);
        window.location.href = '/dreamdressv1/frontend/compra/resumen_carritocomp.html';
      } else {
        alert('Error al guardar el carrito: ' + data.message);
      }
    })
    .catch(err => {
      console.error('❌ Error al guardar el carrito:', err);
      alert('Error inesperado al guardar el carrito.');
    });
  }
  
