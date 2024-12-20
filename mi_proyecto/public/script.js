// Obtener usuarios y mostrarlos
fetch('/usuarios')
  .then(response => response.json())
  .then(data => {
    const tableBody = document.getElementById('userTableBody');
    data.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.firstName}</td>
        <td>${user.lastName}</td>
        <td>${user.email}</td>
        <td>${user.phoneNumber}</td>
        <td>
          <button onclick="eliminarUsuario(${user.PK_user})">Eliminar</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  });

// Eliminar usuario
function eliminarUsuario(id) {
  fetch(`/usuarios/${id}`, { method: 'DELETE' })
    .then(response => {
      if (response.ok) {
        alert('Usuario eliminado');
        window.location.reload();
      } else {
        alert('Error al eliminar usuario');
      }
    });
}
