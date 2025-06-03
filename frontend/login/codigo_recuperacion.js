document.getElementById('form-recuperar').addEventListener('submit', async function(e) {
    e.preventDefault();
    const correo = document.getElementById('correo').value;
  
    const response = await fetch('http://dreamdressv2.test/backend/api/enviar_codigo_recuperacion.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({correo})
    });
  
    const data = await response.json();
    const mensaje = document.getElementById('mensaje');
  
    if (data.status === 'success') {
      localStorage.setItem('email_recuperacion', correo);
      mensaje.textContent = 'Código enviado al correo.';
      document.getElementById('form-verificar').style.display = 'block';
    } else {
      mensaje.textContent = data.message;
    }
  });
  
  document.getElementById('form-verificar').addEventListener('submit', async function(e) {
    e.preventDefault();
    const codigo = document.getElementById('codigo').value;
    const correo = localStorage.getItem('email_recuperacion');
  
    const response = await fetch('http://dreamdressv2.test/backend/api/verificar_codigo.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({correo, codigo})
    });
  
    const text = await response.text();
    console.log("📨 RESPUESTA DEL SERVIDOR AL VERIFICAR CÓDIGO:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      document.getElementById('mensaje').textContent = "❌ Error inesperado: el servidor no respondió con JSON.";
      return;
    }
  
    const mensaje = document.getElementById('mensaje');
  
    if (data.status === 'success') {
      window.location.href = 'http://dreamdressv2.test/frontend/login/nueva_contrasena.html';
    } else {
      mensaje.textContent = data.message;
    }
  });
  