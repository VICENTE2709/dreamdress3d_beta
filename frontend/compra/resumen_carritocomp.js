document.addEventListener('DOMContentLoaded', () => {
  const usuario_id = localStorage.getItem('usuario_id');
  const tabla = document.getElementById('tabla-resumen');
  const total = document.getElementById('total');
  let suma = 0;

  fetch(`http://dreamdressv1.test/dreamdressv1/backend/api/resumen_carrito_api.php?usuario_id=${usuario_id}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        data.productos.forEach(p => {
          const fila = document.createElement('tr');
          const subtotal = p.Precio * p.Cantidad;
          suma += subtotal;

          console.log(p);

          fila.innerHTML = `
            <td><img src="${p.Imagen}" width="50"></td>
            <td>${p.NombreProducto}</td>
            <td>${p.Cantidad}</td>
            <td>${p.Precio} Bs</td>
            <td>${subtotal} Bs</td>
          `;
          tabla.appendChild(fila);
        });

        total.textContent = `Total: ${suma} Bs`;
      } else {
        alert('No se pudo cargar el resumen del carrito.');
      }
    });

  document.getElementById('confirmar').addEventListener('click', () => {
    // Aquí llamaremos luego a procesar_compra.php
    alert('Compra confirmada. En el siguiente paso irá el proceso final.');
    localStorage.removeItem('carrito'); // opcional
  });
});
  