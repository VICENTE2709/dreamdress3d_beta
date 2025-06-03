// factura.js

document.addEventListener('DOMContentLoaded', async () => {
  const usuario_id = localStorage.getItem('usuario_id');
  const carrito_id = localStorage.getItem('carrito_id');
  const clienteList = document.getElementById('datos-cliente');
  const tabla = document.getElementById('tabla-productos');
  const total = document.getElementById('total-compra');

  if (!usuario_id || !carrito_id) {
    alert('Error: sesión o carrito inválido.');
    return;
  }

  try {
    // Cargar datos del cliente
    const resCliente = await fetch(`http://dreamdressv1.test/dreamdressv1/backend/api/datos_cliente_api.php?usuario_id=${usuario_id}`);
    const dataCliente = await resCliente.json();
    if (dataCliente.status === 'success') {
      const c = dataCliente.cliente;
      clienteList.innerHTML = `
        <li class="list-group-item">Nombre completo: ${c.Nombre} ${c.Ap_paterno} ${c.Ap_materno}</li>
        <li class="list-group-item">CI: ${c.CI}</li>
        <li class="list-group-item">Correo: ${c.Correo}</li>
        <li class="list-group-item">Dirección: ${c.Ciudad}, ${c.Zona}, ${c.Calle} #${c.Nro_puerta}</li>
        <li class="list-group-item">Teléfono: ${c.Telefono}</li>
      `;
    } else {
      alert('No se pudo cargar los datos del cliente.');
    }

    // Cargar detalle del carrito desde la vista
    const resProductos = await fetch(`http://dreamdressv1.test/dreamdressv1/backend/api/resumen_carrito_api.php?usuario_id=${usuario_id}`);
    const dataProductos = await resProductos.json();

    if (dataProductos.status === 'success') {
      let suma = 0;
      dataProductos.productos.forEach(p => {
        const fila = document.createElement('tr');
        const subtotal = parseFloat(p.Precio) * parseInt(p.Cantidad);
        suma += subtotal;

        fila.innerHTML = `
          <td>${p.NombreProducto}</td>
          <td>${p.Cantidad}</td>
          <td>${parseFloat(p.Precio).toFixed(2)} Bs</td>
          <td>${subtotal.toFixed(2)} Bs</td>
        `;
        tabla.appendChild(fila);
      });
      total.textContent = `${suma.toFixed(2)} Bs`;
    } else {
      alert('No se pudo cargar los productos.');
    }
  } catch (error) {
    console.error('Error al cargar factura:', error);
    alert('Error al generar la factura.');
  }
});
