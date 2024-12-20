const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Conexión a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'login',
  password: 'DDL-8100e',
  port: 5432,
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal (Login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "tbUsers"');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error al obtener usuarios');
  }
});

// Ruta para agregar un nuevo usuario
app.post('/usuarios', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, nickName, password } = req.body;
  try {
    await pool.query(
      'INSERT INTO "tbUsers" ("firstName", "lastName", "email", "phoneNumber", "nickName", "password") VALUES ($1, $2, $3, $4, $5, $6)',
      [firstName, lastName, email, phoneNumber, nickName, password]
    );
    res.status(201).send('Usuario creado');
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    res.status(500).send('Error al agregar usuario');
  }
});

// Ruta para eliminar un usuario
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "tbUsers" WHERE "PK_user" = $1', [id]);
    res.send('Usuario eliminado');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).send('Error al eliminar usuario');
  }
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT u."firstName", u."lastName", u."nickName", ul."FK_loginLevel"
       FROM "tbUsers" u
       INNER JOIN "tbUserLevel" ul ON u."PK_user" = ul."FK_user"
       WHERE u."email" = $1 AND u."password" = $2`,
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      let role = '';

      // Asignar rol según el nivel de usuario
      switch (user.FK_loginLevel) {
        case 1:
          role = 'Rector';
          break;
        case 2:
          role = 'Jefe de Planta';
          break;
        case 3:
          role = 'Secretaria';
          break;
        case 4:
          role = 'Pasante';
          break;
        default:
          role = 'Usuario';
      }

      res.json({ role, user });
    } else {
      res.status(401).send('Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).send('Error interno del servidor');
  }
});
