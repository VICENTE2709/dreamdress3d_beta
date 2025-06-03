    document.getElementById('form-contrasena').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const nueva = document.getElementById('nueva').value;
    const confirmar = document.getElementById('confirmar').value;
    const correo = localStorage.getItem('email_recuperacion');
    const mensaje = document.getElementById('mensaje');
  
    if (nueva !== confirmar) {
      mensaje.textContent = 'Las contraseñas no coinciden.';
      return;
    }
  
    const response = await fetch('http://dreamdressv2.test/backend/api/actualizar_contrasena.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({correo, nueva})
    });
  
    const data = await response.json();
  
    if (data.status === 'success') {
      localStorage.removeItem('email_recuperacion');
      window.location.href = 'http://dreamdressv2.test/frontend/login/login.html';
    } else {
      mensaje.textContent = data.message;
    }
  });
  