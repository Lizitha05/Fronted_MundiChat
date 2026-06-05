
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const app = express();

//*Es importante es el socket
const { Server } = require("socket.io")

const io = new Server(3000, {
  cors: {
    origin: "*"
  }
})

io.on('connection', socket =>{
    socket.on('send-chat-message', data=>{
        socket.broadcast.emit('chat-message', data)
    })
})


const PagesRoutes = require('./routes/Rutas.js'); //Variable que guarda la direccion de mis rutas

const PORT = 3001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

//Importar las rutas personalizadas
app.use('/', PagesRoutes);

// Escuchar servidor
app.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:3001');
});

// Conexión a la base de datos

//!Aby
/* const Db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'mundichat',
  password: 'abc123',
  database: 'mundiChat',
  port: 3306
}); */

//!Liz
const Db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Noe_050703',
  database: 'mundiChat',
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

const strg = multer.memoryStorage();
const archivo = multer({
    storage: strg

}
)

//Iniciar sesion

app.post('/feature-login', async (req, res) => {

  const { mailUser, passwordUser } = req.body; //Estos son los name de los input

  // Validar que los campos no estén vacíos
  if (!mailUser || !passwordUser) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }

  Db.query('call sp_userLogin(?,?,@existe,@mensaje)', [mailUser, passwordUser], (err, result) => {
    if (err) {
      console.log(err);
      res.json({ msg: "Error" });
    }

    Db.query('select @existe as existe , @mensaje as mensaje', (err2, result2) => {

      const { existe, mensaje } = result2[0];
      if (existe === 1) {
        res.json({
          msg: mensaje,
          info: result[0][0],
          redirect: "/place"
        });

      } else {
        res.json({ msg: mensaje });
      }
    })
  });

});

//Registrar usuario

app.post('/feature-register',archivo.single('fileOpeneReg'), async (req, res) => {

  if (!req.file) {
   return res.status(400).json({msg: 'La foto es obligatoria'});
  }

 /*  const { mail, nickname, nombre, date, password } = req.body;  //Estos son los name de los input
  const imagen = req.file.buffer.toString('base64');

  const max_sixe_bytes = 5*1024*1024;
  const max_base64_length = 4* Math.ceil(max_sixe_bytes/3);

  if(imagen.lenght > max_base64_length){

    return res.status(400).json({
   
      msg: 'La imagen excede el tamaño máximo permitido (5MB)';
      
    });
   } */
  
  // Validar que los campos no estén vacíos
  if (!mail || !nickname || !nombre || !date || !password ) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }


  const checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!checkEmail.test(mail)) {
    return res.status(400).json({ msg: 'El correo no es válido' });
  }


  const checkPalabras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

  if (!checkPalabras.test(nombre)) {
    return res.status(400).json({ msg: 'El nombre solo puede contener letras y espacios' });
  }

  if (!checkPalabras.test(nickname)) {
    return res.status(400).json({ msg: 'El nickname solo puede contener letras y espacios' });
  }

  const fechaNacimiento = new Date(date); //

  if (isNaN(fechaNacimiento.getTime())) {
    return res.status(400).json({ msg: 'La fecha de nacimiento no es válida' });
  }

  const hoy = new Date();
  if (fechaNacimiento > hoy) {
    return res.status(400).json({ msg: 'La fecha de nacimiento no puede ser en el futuro' });
  }

  // Validar contraseña
  const checkContra = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  if (!checkContra.test(password)) {
    return res.status(400).json({ msg: 'La contraseña no cumple con los requisitos mínimos,total 8 caracteres' });
  }

  

  Db.query('call sp_userRegister(?,?,?,?,?,? , @existe, @mensaje)', [mail, nickname, nombre, date, password,imagen], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ msg: "Error en el servidor" });
    }

    Db.query('select @existe as existe, @mensaje as mensaje', (err2, result2) => {
      if (err2) {
        console.log(err2);
        return res.status(500).json({ msg: "Error en el servidor" });
      }

      const { existe, mensaje } = result2[0];
      if (existe === 1) {
        console.log(mensaje)
         res.json({ msg: mensaje });

      } else {
         res.json({
          msg: mensaje,
          redirect: "/login"
        });
      }
    });
  }
  );

})

//Editar usuario

app.put('/feature-edit',archivo.single('fileOpeneReg'), async (req, res) => {


  if (!req.file) {
   return res.status(400).json({msg: 'La foto es obligatoria'});
  }

  
  const { idUsuario,correoElectronico, apodo, nombreCompleto, cumple } = req.body;  //Estos son los name de los input
  const imagen = req.file.buffer.toString('base64');
 
 
  // Validar que los campos no estén vacíos
  if (!idUsuario || !correoElectronico || !apodo || !nombreCompleto || !cumple  ) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }


  const checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!checkEmail.test(correoElectronico)) {
    return res.status(400).json({ msg: 'El correo no es válido' });
  }


  const checkPalabras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

  if (!checkPalabras.test(nombreCompleto)) {
    return res.status(400).json({ msg: 'El nombre solo puede contener letras y espacios' });
  }

  if (!checkPalabras.test(apodo)) {
    return res.status(400).json({ msg: 'El apodo solo puede contener letras y espacios' });
  }

  const fechaNacimiento = new Date(cumple); //

  if (isNaN(fechaNacimiento.getTime())) {
    return res.status(400).json({ msg: 'La fecha de nacimiento no es válida' });
  }

  const hoy = new Date();
  if (fechaNacimiento > hoy) {
    return res.status(400).json({ msg: 'La fecha de nacimiento no puede ser en el futuro' });
  }

   
 
  Db.query('call sp_userUpdate(?,?,?,?,?,?, @existe, @mensaje)', [idUsuario,nombreCompleto,correoElectronico,apodo,cumple,imagen], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ msg: "Error en el servidor" });
    }

    Db.query('select @existe as existe, @mensaje as mensaje', (err2, result2) => {
      if (err2) {
        
    
        return res.status(500).json({ msg: "Error en el servidor" });
      }

      const { existe, mensaje } = result2[0];
      if (existe === 1) {
        console.log(mensaje)
         res.json({ msg: mensaje,
          redirect: "/profile",
          usuario:{
            usuarioPK: idUsuario,
            nombreCompleto: nombreCompleto,
            correo: correoElectronico,
            nomUsu: apodo,
            fechaNacimiento: cumple,
            foto: imagen

          }
         });

      } 
    });
  }
  );

})


//TRAER CUPONES DE USUARIO
app.get('/request-cupones/:usuario_id', (req, res) => {
    const { usuario_id } = req.params;
    Db.query(
        `SELECT c.cuponPK, c.TituloCupon, c.descripcion, c.CodigoCupon, c.vencimiento
         FROM cupon c
         INNER JOIN UsuarioCupon uc ON c.cuponPK = uc.CuponFK
         WHERE uc.UsuarioFK = ?`,
        [usuario_id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Error en conexión con la base' });
            }
            res.json(result);
        }
    );
});

//TRAER EVENTOS DE USUARIO
app.get('/request-eventos', (req, res) => {
    Db.query(
        'SELECT * FROM Evento WHERE EventoActivo = 1',
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Error en conexión con la base' });
            }
            res.json(result);
        }
    );
});

//CONFIRMAR ASISTENCIA DE USUARIO
app.post('/confirmar-asistencia', (req, res) => {
    const { evento_id, usuario_id } = req.body;
    
    Db.query(
        'INSERT INTO UsuarioEvento (UsuarioFK, EventoFK) VALUES (?, ?)',
        [usuario_id, evento_id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Error en conexión con la base' });
            }
            res.json({ msg: 'Asistencia confirmada', id: result.insertId });
        }
    );
});

//TRAER ASISTENCIAS DEL USUARIO (NUEVO)
app.get('/mis-asistencias/:usuario_id', (req, res) => {
    const { usuario_id } = req.params;
    
    Db.query(
        'SELECT EventoFK FROM UsuarioEvento WHERE UsuarioFK = ?',
        [usuario_id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Error en conexión con la base' });
            }
            const eventosConfirmados = result.map(row => row.EventoFK);
            res.json(eventosConfirmados);
        }
    );
});

