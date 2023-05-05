const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = function(passport){
    passport.use(new LocalStrategy(async function(username, password, done){
        try{
            const user = await User.findOne({username:username});
            if(!user){
                return done(null, false, {message: 'Usuario no encontrado'});
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if(isMatch){
                return done(null, user, )
            }
            else{
                return done(null, false, {message: 'Password incorrecto'});
            }
        }
        catch(e){
            return console.log(e);
        }

    }));

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(async function(id, done){
        const user = await User.findById(id);
        done(null, user);
    });
};