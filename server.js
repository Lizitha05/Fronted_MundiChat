
const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const app = express();

//*Es importante es el socket
const { Server } = require("socket.io")
const {createServer} = require('node:http')

const server = createServer(app);

//in/out de entrada  y salida
const io = new Server(server,{
    connectionStateRecovery:{}
});


io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    
    // Unirse a una sala de chat específica
    socket.on('join chat', (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`Usuario ${socket.id} unido a sala: chat_${chatId}`);
    });
    
    // Enviar mensaje a un chat específico
    socket.on('chat message', (data) => {
        // data debe contener: { chatId, mensaje, autorPK, autorNombre }
        console.log(`Mensaje para chat_${data.chatId}: ${data.mensaje.texto}`);
        
        // Emitir SOLO a los usuarios en esa sala
        io.to(`chat_${data.chatId}`).emit('chat message', data);
    });
    
     
    //!llamadas

    //Escoger sala o user
    socket.on('union-llamada', (chatId)=>{
        const salaNombre = `call_${chatId}`;
        socket.join(salaNombre);

        const sala = io.sockets.adapter.rooms.get(salaNombre);

        const numCliente = sala ? sala.size:0;

        if(numCliente ===1){
            socket.emit('llamada-creada' , salaNombre);

        }else if(numCliente ===2){

            socket.to(salaNombre).emit('usuario-unido-llamada',socket.id);
            socket.emit('llamada-unida',salaNombre);

        }else{
            socket.emit('llamada-llena') //! solo es de 1 a 1
        }
    });

    socket.on('llamada-lista' ,(chatId)=>{
     
        socket.to(`call_${chatId}`).emit('llamada-lista');
    });

    socket.on('ofrecer' ,(data) =>{
        socket.to(`call_${data.chatId}`).emit('ofrecer',{
            offer:data.offer,
            from: socket.id
        });
    });

     socket.on('preguntar' ,(data) =>{
        socket.to(`call_${data.chatId}`).emit('preguntar',{
            answer:data.answer,
            from: socket.id
        });
    });

     socket.on('candidatos' ,(data) =>{
        socket.to(`call_${data.chatId}`).emit('candidatos',{
            candidate:data.candidate,
            from: socket.id
        });
    });


    socket.on('colgar-llamada' ,(chatId) =>{
        const salaNombre = `call_${chatId}`;
        socket.leave(salaNombre);
        socket.to(salaNombre).emit('peer-left-call');
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

const PagesRoutes = require('./routes/Rutas.js'); //Variable que guarda la direccion de mis rutas

const PORT = 3001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

//Importar las rutas personalizadas
app.use('/', PagesRoutes);

// Escuchar servidor
server.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:3001');
});

// Conexión a la base de datos

//!Aby
const Db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'mundichat',
  password: 'abc123',
  database: 'mundiChat',
  port: 3306
});

//!Andreiy
/* const Db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'emp4eTDYCAMG!',
  database: 'mundiChat',
  port: 3306
}); */

//!Liz
/* const Db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Noe_050703',
  database: 'mundiChat',
  port: 3306
}); */
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
          redirect: "/index-login"
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


//!Chats

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
// ========== 1. OBTENER TODOS LOS USUARIOS (excepto el actual) ==========
app.get('/api/usuarios/:usuarioActualId', (req, res) => {
    const { usuarioActualId } = req.params;
    
    const query = `
        SELECT 
            u.usuarioPK,
            u.nomUsu,
            u.nombreCompleto,
            u.foto,
            u.estado,
            u.correo,
            (SELECT COUNT(*) FROM mensaje m 
             JOIN chat c ON m.chatFK = c.chatPK
             JOIN usuariosEnChat uec ON c.chatPK = uec.chatFK
             WHERE uec.usuarioFK = ? AND m.creadorMensajeFK = u.usuarioPK
             ORDER BY m.fecha DESC LIMIT 1) AS tieneMensajes
        FROM usuario u
        WHERE u.usuarioPK != ?
        ORDER BY u.nomUsu ASC
    `;
    
    Db.query(query, [usuarioActualId, usuarioActualId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error en conexión con la base' });
        }
        
        // Para cada usuario, buscar o crear el chat existente
        const usuariosConChat = result.map(usuario => ({
            ...usuario,
            chatId: null,
            ultimoMensaje: '',
            existeChat: false
        }));
        
        res.json({ success: true, usuarios: usuariosConChat });
    });
});

// ========== 2. OBTENER O CREAR CHAT CON UN USUARIO ==========
app.get('/api/obtener-o-crear-chat/:usuario1Id/:usuario2Id', (req, res) => {
    const { usuario1Id, usuario2Id } = req.params;
    
    // Buscar si ya existe un chat entre estos dos usuarios
    const buscarChatQuery = `
        SELECT DISTINCT c.chatPK, c.chatPK AS chatId, c.nombreChat, c.tipoSesion
        FROM chat c
        JOIN usuariosEnChat uec1 ON c.chatPK = uec1.chatFK
        JOIN usuariosEnChat uec2 ON c.chatPK = uec2.chatFK
        WHERE uec1.usuarioFK = ? AND uec2.usuarioFK = ?
        AND (SELECT COUNT(*) FROM usuariosEnChat uec WHERE uec.chatFK = c.chatPK) = 2
        AND c.tipoSesion = 'privado'
    `;
    
    Db.query(buscarChatQuery, [usuario1Id, usuario2Id], (err, chatExistente) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error al buscar chat' });
        }
        
        if (chatExistente.length > 0) {
            // Chat ya existe
            const chatId = chatExistente[0].chatPK;
            
            // Obtener información actualizada del chat
            const getChatInfoQuery = `
                SELECT 
                    c.chatPK AS chatId,
                    c.nombreChat,
                    c.tipoSesion,
                    COALESCE(
                        (SELECT m.texto 
                         FROM mensaje m 
                         WHERE m.chatFK = c.chatPK 
                         ORDER BY m.fecha DESC 
                         LIMIT 1),
                        ''
                    ) AS ultimoMensaje
                FROM chat c
                WHERE c.chatPK = ?
            `;
            
            Db.query(getChatInfoQuery, [chatId], (err2, chatInfo) => {
                if (err2) {
                    console.log(err2);
                    return res.status(500).json({ success: false, error: 'Error al obtener info del chat' });
                }
                
                res.json({ 
                    success: true, 
                    existe: true, 
                    chat: chatInfo[0],
                    msg: 'Chat existente'
                });
            });
        } else {
            // Crear nuevo chat privado
            const crearChatQuery = `
                INSERT INTO chat (nombreChat, tipoSesion, creadorChatFK)
                VALUES (?, 'privado', ?)
            `;
            const nombreChat = `Chat_${usuario1Id}_${usuario2Id}`;
            
            Db.query(crearChatQuery, [nombreChat, usuario1Id], (err3, result) => {
                if (err3) {
                    console.log(err3);
                    return res.status(500).json({ success: false, error: 'Error al crear chat' });
                }
                
                const nuevoChatId = result.insertId;
                
                // Agregar ambos usuarios al chat
                const agregarUsuariosQuery = `
                    INSERT INTO usuariosEnChat (usuarioFK, chatFK)
                    VALUES (?, ?), (?, ?)
                `;
                
                Db.query(agregarUsuariosQuery, [usuario1Id, nuevoChatId, usuario2Id, nuevoChatId], (err4) => {
                    if (err4) {
                        console.log(err4);
                        return res.status(500).json({ success: false, error: 'Error al agregar usuarios al chat' });
                    }
                    
                    res.json({ 
                        success: true, 
                        existe: false, 
                        chat: {
                            chatId: nuevoChatId,
                            nombreChat: nombreChat,
                            tipoSesion: 'privado',
                            ultimoMensaje: ''
                        },
                        msg: 'Chat creado exitosamente'
                    });
                });
            });
        }
    });
});

// ========== 3. OBTENER MENSAJES DE UN CHAT ==========
app.get('/api/mensajes/:chatId', (req, res) => {
    const { chatId } = req.params;
    
    const query = `
        SELECT 
            m.mensajePK AS mensajeId,
            m.texto,
            m.fecha,
            m.creadorMensajeFK AS creadorPK,
            u.nomUsu AS autorNombre,
            u.foto AS autorFoto
        FROM mensaje m
        JOIN usuario u ON m.creadorMensajeFK = u.usuarioPK
        WHERE m.chatFK = ?
        ORDER BY m.fecha ASC
    `;
    
    Db.query(query, [chatId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error al obtener mensajes' });
        }
        res.json({ success: true, mensajes: result });
    });
});



// ========== CORREGIR LA RUTA /api/mensajes (quitar updateChatQuery) ==========
app.post('/api/mensajes', (req, res) => {
    const { chatFK, texto, creadorMensajeFK } = req.body;
    const fecha = new Date();
    
    const query = `
        INSERT INTO mensaje (texto, fecha, creadorMensajeFK, chatFK)
        VALUES (?, ?, ?, ?)
    `;
    
    Db.query(query, [texto, fecha, creadorMensajeFK, chatFK], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error al guardar mensaje' });
        }
        
        const nuevoMensaje = {
            mensajePK: result.insertId,
            texto: texto,
            fecha: fecha,
            creadorMensajeFK: creadorMensajeFK
        };
        
        res.json({ success: true, mensaje: nuevoMensaje });
    });
});
// ========== 5. OBTENER ÚLTIMO MENSAJE DEL CHAT ==========
app.get('/api/ultimo-mensaje/:chatId', (req, res) => {
    const { chatId } = req.params;
    
    const query = `
        SELECT texto, fecha, creadorMensajeFK
        FROM mensaje
        WHERE chatFK = ?
        ORDER BY fecha DESC
        LIMIT 1
    `;
    
    Db.query(query, [chatId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error al obtener último mensaje' });
        }
        res.json({ success: true, ultimoMensaje: result[0] || null });
    });
});
// ========== 6. OBTENER TODOS LOS CHATS DE UN USUARIO ==========
app.get('/api/mis-chats/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    
    const query = `
        SELECT DISTINCT
            c.chatPK AS chatId,
            u2.nomUsu AS otroUsuarioNombre,
            u2.foto AS otroUsuarioFoto,
            u2.usuarioPK AS otroUsuarioId,
            COALESCE(
                (SELECT m.texto FROM mensaje m WHERE m.chatFK = c.chatPK ORDER BY m.fecha DESC LIMIT 1),
                ''
            ) AS ultimoMensaje
        FROM chat c
        JOIN usuariosEnChat uec1 ON c.chatPK = uec1.chatFK
        JOIN usuariosEnChat uec2 ON c.chatPK = uec2.chatFK AND uec2.usuarioFK != uec1.usuarioFK
        JOIN usuario u2 ON uec2.usuarioFK = u2.usuarioPK
        WHERE uec1.usuarioFK = ? AND c.tipoSesion = 'privado'
        ORDER BY (SELECT MAX(m.fecha) FROM mensaje m WHERE m.chatFK = c.chatPK) DESC
    `;
    
    Db.query(query, [usuarioId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error al obtener chats' });
        }
        res.json({ success: true, chats: result });
    });
});

// ========== 7. OBTENER USUARIOS (versión simplificada sin mensajes) ==========
app.get('/api/usuarios-simple/:usuarioActualId', (req, res) => {
    const { usuarioActualId } = req.params;
    
    const query = `
        SELECT 
            u.usuarioPK,
            u.nomUsu,
            u.nombreCompleto,
            u.foto,
            u.estado
        FROM usuario u
        WHERE u.usuarioPK != ?
        ORDER BY u.nomUsu ASC
    `;
    
    Db.query(query, [usuarioActualId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error en conexión con la base' });
        }
        res.json({ success: true, usuarios: result });
    });
});

// ========== 8. VERIFICAR CHAT EXISTENTE ==========
app.get('/api/verificar-chat/:usuario1Id/:usuario2Id', (req, res) => {
    const { usuario1Id, usuario2Id } = req.params;
    
    const query = `
        SELECT c.chatPK
        FROM chat c
        JOIN usuariosEnChat uec1 ON c.chatPK = uec1.chatFK
        JOIN usuariosEnChat uec2 ON c.chatPK = uec2.chatFK
        WHERE uec1.usuarioFK = ? AND uec2.usuarioFK = ?
        AND (SELECT COUNT(*) FROM usuariosEnChat uec WHERE uec.chatFK = c.chatPK) = 2
    `;
    
    Db.query(query, [usuario1Id, usuario2Id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, error: 'Error al verificar chat' });
        }
        
        res.json({ 
            success: true, 
            existe: result.length > 0,
            chatId: result[0]?.chatPK || null
        });
    });
});
