const metodoSelect = document.getElementById('metodo_pago');
const opcionesQR = document.getElementById('opciones-qr');
const montoCuota = document.getElementById('monto-cuota');
const resumenTotal = document.getElementById('resumen_total');
const montoInput = document.getElementById('monto_parcial');

let totalCompra = 0;

metodoSelect.addEventListener('change', () => {
  opcionesQR.style.display = metodoSelect.value === '2' ? 'block' : 'none';
});

document.querySelectorAll('input[name="tipo_pago"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    montoCuota.style.display = e.target.value === '2' ? 'block' : 'none';
  });
});

document.getElementById('form-pago').addEventListener('submit', async (e) => {
  e.preventDefault();
  const metodo = metodoSelect.value;
  const tipo = document.querySelector('input[name="tipo_pago"]:checked')?.value || 1;
  const monto = tipo === '2' ? parseFloat(montoInput.value || 0) : totalCompra;

  if (tipo === '2' && monto > totalCompra) {
    alert(`El monto ingresado no puede ser mayor al total de la compra (${totalCompra.toFixed(2)} Bs).`);
    return;
  }

  const usuario_id = localStorage.getItem('usuario_id');
  const carrito_id = localStorage.getItem('carrito_id');

  const body = {
    usuario_id,
    carrito_id,
    metodo_pago_id: metodo,
    tipo_pago_id: tipo,
    monto: monto
  };

  try {
    const res = await fetch('http://dreamdressv1.test/dreamdressv1/backend/api/procesar_pago_api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.status === 'success') {
      alert('✅ Pago registrado correctamente.');

      if (metodo === '1') {
        // Efectivo
        window.location.href = 'http://localhost/DreamDressV1/dreamdressv1/frontend/compra/resumen_pago_efectivo.html';
      } else if (tipo === '1') {
        // QR - Pago total
        window.location.href = 'http://localhost/DreamDressV1/dreamdressv1/frontend/compra/factura.html';
      } else {
        // QR - Pago en cuotas
        window.location.href = 'http://localhost/DreamDressV1/dreamdressv1/frontend/compra/recibo_cuotas.html';
      }
    } else {
      alert('Error al procesar el pago: ' + data.message);
    }
  } catch (error) {
    alert('Error de conexión con el servidor');
    console.error(error);
  }
});

// Cargar resumen total desde la API
async function cargarResumenTotal() {
  const usuario_id = localStorage.getItem('usuario_id');
  if (!usuario_id) return;

  try {
    const res = await fetch(`http://dreamdressv1.test/dreamdressv1/backend/api/resumen_carrito_api.php?usuario_id=${usuario_id}}`);
    const data = await res.json();
    if (data.status === 'success') {
      totalCompra = data.productos.reduce((sum, p) => sum + (parseFloat(p.Subtotal) || 0), 0);
      resumenTotal.textContent = `${totalCompra.toFixed(2)} Bs`;
    }
  } catch (error) {
    console.error('Error al cargar el resumen del carrito:', error);
  }
}

cargarResumenTotal();

