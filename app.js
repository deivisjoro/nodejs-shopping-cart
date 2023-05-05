const path = require('path');

const dotenv     = require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');
const session    = require('express-session');
const expressValidator = require('express-validator');
const connectFlash     = require('connect-flash');
const expressMessages  = require('express-messages');
const fileUpload       = require('express-fileupload');
const passport         = require('passport');
const auth             = require('./src/config/auth');

const bootstap = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log(`App conectada a la BD`)

        const PORT = process.env.PORT || 3000;

        const app = express();

        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'src', 'views'));

        app.use(express.static(path.join(__dirname, 'public')));

        app.locals.errors = null;

        const Page = require('./src/models/page');
        const pages = await Page.find({}).sort({sorting:1}).exec();
        app.locals.pages = pages;

        const Category = require('./src/models/category');
        const categories = await Category.find();
        app.locals.categories = categories;

        app.use(fileUpload());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(session({
            secret: 'abc123',
            resave: true,
            saveUninitialized: true
        }));
        app.use(expressValidator({
            errorFormatter: function(param, msg, value){
                let namespace = param.split('.');
                let root = namespace.unshift();
                let formParam = root;

                while(namespace.length){
                    formParam += '[' + namespace.shift() + ']';
                }

                return {
                    param: formParam,
                    msg,
                    value
                };
            },
            customValidators: {
                isImage: function(value, filename){
                    const extension = (path.extname(filename)).toLowerCase();
                    switch(extension){
                        case '.jpg': return '.jpg';
                        case '.jpeg': return '.jpeg';
                        case '.png': return '.png';
                        case '': return '.jpg';
                        default: return false;
                    }
                }
            }
        })); 
        //app.use(expressValidator());
        app.use(connectFlash());
        app.use((req, res, next)=>{
            res.locals.messages = expressMessages(req, res);
            next();
        });

        require('./src/config/passport')(passport);
        app.use(passport.initialize());
        app.use(passport.session());


        app.all('*', (req, res, next)=>{
            res.locals.cart = req.session.cart;
            res.locals.user = req.user || null;
            next();
        });

        const routePages = require('./src/routes/default/pages.routes');
        const routeProducts = require('./src/routes/default/products.routes');
        const routeCart = require('./src/routes/default/cart.routes');
        const routeUsers = require('./src/routes/default/users.routes');

        const routePagesAdmin = require('./src/routes/admin/pages.admin.routes');
        const routeCategoriesAdmin = require('./src/routes/admin/categories.admin.routes');
        const routeProductsAdmin = require('./src/routes/admin/products.admin.routes');        

        app.use('/admin/pages', auth.isAdmin, routePagesAdmin);
        app.use('/admin/categories', auth.isAdmin, routeCategoriesAdmin);
        app.use('/admin/products', auth.isAdmin, routeProductsAdmin);
        app.use('/products', routeProducts);
        app.use('/cart', routeCart); 
        app.use('/users', routeUsers); 
        app.use('/', routePages);

        app.listen(PORT, ()=>{
            console.log(`Servidor activo en el puerto ${PORT} http://localhost:${PORT}`);
        });
    }
    catch(error){
        throw new Error(`ERROR :: ${error}`);
    }
    
    
}

bootstap();