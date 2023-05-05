const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: String,
    nombre: {
        type: String,
        required: true
    }
})

const UserModel = mongoose.model('User', UserSchema);

const usuario = new UserModel({})
usuario.save()


/* app.get('/', (req, res)=>{
    const pageSchema = new mongoose.Schema({
        nombre: String
    })
    const pageModel = mongoose.model('Page', pageSchema);
    const page = new pageModel({nombre: "pagina1"});
    page.save()
    res.render('pages/home.ejs', {
        title: 'Home    '
    })
}) */