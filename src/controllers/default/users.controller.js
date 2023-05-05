const passport = require('passport');
const bcryptjs = require('bcryptjs');
const User = require('../../models/user');

const usersController = {};


usersController.register = async (req, res)=>{    
    try{   
        
        if(res.locals.user){
            req.flash('success', 'El usuario esta legueado!');
            res.redirect('/');
            return;
        }
        
        const usuario = {
            name: '',
            email: '',
            username: '',
            password: ''
        }
        
        res.render('pages/default/users/register',{
            title: 'Registro de usuarios',
            usuario,
            repassword: ''
        });
       
    }
    catch(e){
        return console.log(e);
    }        
};

usersController.registerSave = async (req, res)=>{    
    try{   

        const user = req.body;

        req.checkBody('name', 'El nombre debe tener un valor').notEmpty();
        req.checkBody('email', 'El email debe tener un valor valido').isEmail();
        req.checkBody('username', 'El username debe tener un valor').notEmpty();
        req.checkBody('password', 'El password debe tener un valor').notEmpty();
        req.checkBody('repassword', 'Los password no coinciden').equals(user.password);

        const result = await req.getValidationResult();
        const errors = result.array();

        if(errors.length>0){
            res.render('pages/default/users/register', {
                errors,
                title: 'Registro de usuarios',
                usuario: user,
                repassword: user.repassword,
                user: null
            });
        }
        else{
            const u = await User.findOne({username: user.username});
            if(u){
                req.flash('danger', 'El username existe, por favor seleccione otro');
                res.render('pages/default/users/register', {
                    errors,
                    title: 'Registro de usuarios',
                    usuario: user,
                    repassword: user.repassword,
                    user: null
                });
            }
            else{
                const u = new User({
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    password: user.password,
                    admin: 0 
                });

                const salt = await bcryptjs.genSaltSync(10);
                const hash = await bcryptjs.hash(u.password, salt);
                u.password = hash;
                await u.save();
                req.flash('success', 'El usuario se ha registrado!');
                res.redirect('/users/login');
            }
        }
       
    }
    catch(e){
        return console.log(e);
    }        
};

usersController.login = async (req, res)=>{    
    try{   
        if(res.locals.user){
            req.flash('success', 'El usuario ya esta legueado!');
            res.redirect('/');
            return;
        }
        
        const user = {
            username: '',
            password: ''
        }

        res.render('pages/default/users/login',{
            title: 'Login de usuarios',
            usuario: user
        });
       
    }
    catch(e){
        return console.log(e);
    }        
};

usersController.loginSave = async (req, res, next)=>{    
    try{   

        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/users/login',
            failureFlash: true
        })(req, res, next);
       
    }
    catch(e){
        return console.log(e);
    }        
};

usersController.logout = async (req, res, next)=>{    
    try{   

        req.logout(function(err){
            if (err) { return next(err); }
            
            req.flash('success', 'Usted ha cerrado su sesion');
            res.redirect('/users/login');
        });
       
    }
    catch(e){
        return console.log(e);
    }        
};


module.exports = usersController;
