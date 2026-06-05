function getUsuarioId() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return null;
    return usuario.usuarioPK || null;
}

