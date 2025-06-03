document.addEventListener('DOMContentLoaded', async () => {
  const usuario_id = localStorage.getItem('usuario_id');
  const carrito_id = localStorage.getItem('carrito_id');

  if (!usuario_id || !carrito_id) {
    alert("Sesión inválida. Inicia sesión nuevamente.");
    window.location.href = "http://localhost/DreamDressV1/dreamdressv1/frontend/login/login.html";
    return;
  }

  try {
    const res = await fetch(`http://dreamdressv1.test/dreamdressv1/backend/api/resumen_carrito_api.php?usuario_id=${usuario_id}`);
    const data = await res.json();

    if (data.status !== 'success') {
      alert('Error al obtener resumen de la compra');
      return;
    }

    const resumen = document.getElementById('resumen-detalle');
    const productos = data.productos;
    let subtotalTotal = 0;

    productos.forEach(p => {
      const fila = document.createElement('tr');
      const subtotal = parseFloat(p.Subtotal || 0);
      subtotalTotal += subtotal;

      fila.innerHTML = `
        <td>${p.NombreProducto}</td>
        <td>${p.Cantidad}</td>
        <td>${p.Precio} Bs</td>
        <td>${subtotal.toFixed(2)} Bs</td>
      `;
      resumen.appendChild(fila);
    });

    document.getElementById('resumen-total').textContent = `${subtotalTotal.toFixed(2)} Bs`;

    // Cargar datos del cliente
    const clienteRes = await fetch(`http://dreamdressv1.test/dreamdressv1/backend/api/datos_cliente_api.php?usuario_id=${usuario_id}`);
    const clienteData = await clienteRes.json();

    if (clienteData.status === 'success') {
      document.getElementById('cliente-nombre').textContent = clienteData.datos.NombreCompleto;
      document.getElementById('cliente-correo').textContent = clienteData.datos.Correo;
    }
  } catch (err) {
    console.error('❌ Error al cargar datos del recibo:', err);
    alert('Error al mostrar el recibo de pago.');
  }
});
