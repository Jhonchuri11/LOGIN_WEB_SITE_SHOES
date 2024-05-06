const bcrypt = require('bcrypt');
const { redirect } = require('react-router-dom');

function login(req, res) {
    if(req.session.loggedin != true ){
        res.render('login/login');
    } else  {
        redirect('/');
    }
}

function register(req, res) {
    if(req.session.loggedin != true) {
    res.render('login/register');
    } else {
        res.redirect('/');
    }
}

function registeradmin(req, res) {
    if(req.session.loggedin != true) {
    res.render('login/registerad');
    } else {
        res.redirect('/');
    }
}


function auth(req, res) {
    const data = req.body;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM usuarios WHERE email = ?', [data.email], (err, userdata) => {
            if (userdata.length > 0) {
                const user = userdata[0]; // Solo tomamos el primer usuario encontrado
                bcrypt.compare(data.contrasena, user.contrasena, (err, isMatch) => {
                    if (!isMatch) {
                        res.render('login/login', { error: 'Error: Contraseña incorrecta' });
                    } else {
                        req.session.loggedin = true;
                        req.session.name = user.nombre;
                        req.session.role = user.rol;
                        if (user.rol === 'administrador') { 
                            res.redirect('/admin');
                        } else {
                            res.redirect('/');
                        }
                    }
                });
            } else {
                res.render('login/login', { error: 'Error: El usuario no existe' });
            }
        });
    });
}




function storeUser(req, res) {
    const data = req.body;

    data.rol = 'usuario';

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM usuarios WHERE email = ?', [data.email], (err, userdata) => {
            if(userdata.length > 0) {
                res.render('login/register', {error: 'Error: El usuario ya existe'});
            } else {
                bcrypt.hash(data.contrasena, 12).then(hash => {
                    data.contrasena = hash;
                    conn.query('INSERT INTO usuarios SET ?', [data], (err, rows) => {
                        if (err) {
                            console.error(err);
                            res.render('login/register', {error: 'Error al registrar usuario'});
                        } else {
                            res.redirect('/login');
                        }
                    });
                }).catch(err => {
                    console.error(err);
                    res.render('login/register', {error: 'Error al registrar usuario'});
                });
            }   
        });
    });
}

function storeAdmin(req, res) {
    const data = req.body;

    data.rol = 'administrador';

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        conn.query('SELECT * FROM usuarios WHERE email = ?', [data.email], (err, userdata) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            if(userdata.length > 0) {
                return res.render('login/registerad', {error: 'Error: El administrador ya existe'});
            }
            bcrypt.hash(data.contrasena, 12).then(hash => {
                data.contrasena = hash;
                conn.query('INSERT INTO usuarios SET ?', [data], (err, rows) => {
                    if (err) {
                        console.error(err);
                        return res.render('login/registerad', {error: 'Error al registrar administrador'});
                    }
                    res.redirect('/login');
                });
            }).catch(err => {
                console.error(err);
                res.render('login/registerad', {error: 'Error al registrar administrador'});
            });
        });
    });
}


function logout(req, res) {
    if(req.session.loggedin == true) {
        req.session.destroy();
    } 
    res.redirect('/login');
}

module.exports = {
    login,
    register,
    registeradmin,
    storeUser,
    storeAdmin,
    auth,
    logout,
}