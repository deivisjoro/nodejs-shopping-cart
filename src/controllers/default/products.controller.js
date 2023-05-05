const fse = require('fs-extra');

const Product = require('../../models/product');
const Category = require('../../models/category');

const productsController = {};


productsController.showAll = async (req, res)=>{    
    try{        
        const products = await Product.find();

        res.render('pages/default/products', {
            title: 'Todos los productos',
            products
        });
    }
    catch(e){
        return console.log(e);
    }        
};

productsController.showByCategory = async (req, res)=>{
    try{
        const categorySlug = req.params.category;
        const category = await Category.findOne({slug: categorySlug});
        const products = await Product.find({category: categorySlug});

        if(!category){
            res.redirect('/products');
        }
        else{
            res.render('pages/default/products_category', {
                title: 'Productos categoria: '+category.title,
                products,
                category: category.title
            });
        }

    }
    catch(e){
        return console.log(e);
    }
};

productsController.showProduct = async (req, res)=>{
    try{
        let galleryImages = null;
        const loggedIn = (req.isAuthenticated()) ? true : false;

        const product = await Product.findOne({slug: req.params.product});
        if(!product){
            res.redirect('/products');
        }
        else{
            const galleryDir = 'public/images/products/'+product._id+"/gallery";
            const files = await fse.readdirSync(galleryDir);
            galleryImages = files;

            res.render('pages/default/product', {
                title: 'Producto: '+product.title,
                product,
                galleryImages,
                loggedIn
            });
        }

    }
    catch(e){
        return console.log(e);
    }
};


module.exports = productsController;
