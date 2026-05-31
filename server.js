
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path=require('path');
const app = express();

const PagesRoutes = require('./routes/Rutas.js'); //Variable que guarda la direccion de mis rutas

const PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

//Importar las rutas personalizadas
app.use('/',PagesRoutes); 

// Escuchar servidor
app.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:3001');
});

// Conexión a la base de datos
const Db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Noe_050703',
  database: 'catBlog',
  port: 3306
});

// Validar conexion a la base de datos
Db.connect((ErrorConexion) => {

  if (ErrorConexion) {
      console.log(ErrorConexion);
      return;
  } else {
      console.log('Conectado a la base de datos');
  }
});


//Iniciar sesion

app.post('/Login', async (req, res) => {
  
  const { NombreUsuario, contraUsuario} = req.body; //Estos son los name de los input
 // Validar que los campos no estén vacíos
  if (!NombreUsuario || !contraUsuario) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }
  Db.query('SELECT * FROM usuario WHERE nombreUsu = ? AND contraUsu = ?', [NombreUsuario, contraUsuario], (err, result) => {
      if (err) {
          console.log(err);
          res.json({ msg: "Error" });
      } else if (result.length > 0) {
        
          res.json({
              msg: "registrado",
              info: result[0]
          });

          window.location.href = "/Dashboard"

      } else {
          res.json({
              msg: "No encontrado"
          });
      }
  });

});


/*
app.post('/Login', (req, res) => {
  const { NombreUsuario, contraUsuario } = req.body;

  // Usuario válido de prueba
  const usuarioValido = 'admin';
  const contrasenaValida = '1234';

  if (NombreUsuario === usuarioValido && contraUsuario === contrasenaValida) {
    res.send('Login correcto');
  } else {
    res.status(401).send('Usuario o contraseña incorrectos');
  }
});
*/

//Registro de usuario

app.post('/Register', async (req, res) => {
  const { nameNom, nameApellido, namefN,nameCorreo,nameUsu,nameContra } = req.body;  //Estos son los name de los input

  // Validar que los campos no estén vacíos
  if (!nameNom || !nameApellido || !namefN || !nameCorreo ||!nameUsu || !nameContra) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }

  /* 
   *Nombre(s) y Apellidos solo puede incluir:
    -Letras del alfabeto español
     (es decir, también se pueden escribir acentos y ñ) y espacios en blanco. 
  */

  //Validar el nombre y apellido
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

  if (!nombreRegex.test(nameNom)) {
    return res.status(400).json({ msg: 'El nombre solo puede contener letras y espacios' });
  }

  if (!nombreRegex.test(nameApellido)) {
    return res.status(400).json({ msg: 'El apellido solo puede contener letras y espacios' });
  }

  //Validar la fecha
  /*
  Fecha de nacimiento debe ser una fecha válida y no puede ser después 
  del día actual. 
  */

  const fechaNacimiento = new Date(namefN); //

  // Verificar si es una fecha válida
  if (isNaN(fechaNacimiento.getTime())) {
    return res.status(400).json({ msg: 'La fecha de nacimiento no es válida' });
  }

  // Verificar que no sea una fecha futura
  const hoy = new Date();
  if (fechaNacimiento > hoy) {
    return res.status(400).json({ msg: 'La fecha de nacimiento no puede ser en el futuro' });
  }

  // Validar que el correo tenga un formato correcto
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(nameCorreo)) {
    return res.status(400).json({ msg: 'El correo no es válido' });
  }

  // Validar nombre de usuario
  Db.query('SELECT * FROM usuario WHERE nombreUsu = ?', [nameUsu], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ msg: 'Error en la base de datos' });
    }

    if (result.length > 0) {
      return res.status(400).json({ msg: 'El nombre de usuario ya existe' });
    }



  });

  // Validar contraseña
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  if (!passwordRegex.test(nameContra)) {
    return res.status(400).json({ msg: 'La contraseña no cumple con los requisitos mínimos' });
  }

  // LA FECHA SE AGREGA DESDE LA BASE DE DATOS //

   const newUser = { 
    nombresUsu: nameNom, 
    apellidosUsu: nameApellido,
    fechaNacUsu: namefN,
    correoElecUsu: nameCorreo,
    nombreUsu: nameUsu,
    contraUsu: nameContra };
    
  Db.query('INSERT INTO usuario SET ?', newUser, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ msg: 'Error al guardar el usuario' });
    }

    res.status(201).json({ msg: 'Registro exitoso' });
  })

})
