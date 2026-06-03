
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


//Iniciar sesion

app.post('/feature-login', async (req, res) => {
  
  const { mailUser, passwordUser} = req.body; //Estos son los name de los input

 // Validar que los campos no estén vacíos
  if (!mailUser || !passwordUser) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }

  Db.query('call sp_userLogin(?,?,@existe,@mensaje)', [mailUser, passwordUser], (err, result) => {
      if (err) {
          console.log(err);
          res.json({ msg: "Error" });
      } 

      Db.query('select @existe as existe , @mensaje as mensaje', (err2,result2)=>{

        const {existe,mensaje} = result2[0];
        if (existe === 1) {
          res.json({
            msg:mensaje,
            info: result[0][0],
            redirect:"/place"
          });

        } else {
          res.json({ msg:mensaje});
        }
      })
  });

});


