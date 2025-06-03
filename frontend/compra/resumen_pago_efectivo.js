// resumen_pago_efectivo.js

document.addEventListener('DOMContentLoaded', async () => {
  const usuario_id = localStorage.getItem('usuario_id');
  if (!usuario_id) {
    alert('Usuario no autenticado.');
    return;
  }

  const tabla = document.getElementById('tabla-resumen');
  const total = document.getElementById('total');
  let suma = 0;

  try {
    const res = await fetch(`http://dreamdressv1.test/dreamdressv1/backend/api/resumen_carrito_api.php?usuario_id=${usuario_id}`);
    const data = await res.json();

    if (data.status === 'success') {
      data.productos.forEach(p => {
        const fila = document.createElement('tr');
        const subtotal = parseFloat(p.Precio) * parseInt(p.Cantidad);
        suma += subtotal;

        fila.innerHTML = `
          <td>${p.NombreProducto}</td>
          <td>${p.Cantidad}</td>
          <td>${p.Precio} Bs</td>
          <td>${subtotal.toFixed(2)} Bs</td>
        `;
        tabla.appendChild(fila);
      });

      total.textContent = `Total: ${suma.toFixed(2)} Bs`;
    } else {
      alert('No se pudo cargar el resumen del carrito.');
    }
  } catch (error) {
    console.error('Error al cargar resumen:', error);
    alert('Error al conectarse con el servidor.');
  }
});
