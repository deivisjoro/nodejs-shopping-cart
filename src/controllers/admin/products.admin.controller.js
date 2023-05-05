const mkdirp   = require('mkdirp');
const fse      = require('fs-extra');
const resize   = require('resize-img');
const Product  = require('../../models/product');
const Category = require('../../models/category');

const productsController = {};


productsController.index = async (req, res)=>{    
    try{
        let count = await Product.count();
        const products = await Product.find();
        
        res.render('pages/admin/products/index', {
            products, 
            count, 
            title: 'Listado de productos'
        });

    }
    catch(error){
        return console.log(error);
    }            
};

productsController.addForm = async (req, res)=>{
    const product = {
        title: '',
        descripcion: '',
        price: ''
    };
    try{
        const categories = await Category.find();

        res.render('pages/admin/products/add', {
            product, 
            categories, 
            title: 'Agregar producto'
        });

    }
    catch(e){
        return console.log(e);
    }
    
};

productsController.addSave = async (req, res)=>{
    let imageFile = "";
    if(req.files!==null){
        imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : "";
    }

    req.checkBody('title', 'El titulo debe tener un valor').notEmpty();
    req.checkBody('descripcion', 'La descripcion debe tener un valor').notEmpty();
    req.checkBody('price', 'El precio debe tener un valor').isDecimal();
    req.checkBody('image', 'Debe cargar una imagen jpg/png').isImage(imageFile);

    const product = req.body;

    product.slug = product.title.replace(/\s+/g,'-').toLowerCase();

    const result = await req.getValidationResult();
    const errors = result.array();
    
    if(errors.length>0){
        try{
            const categories = await Category.find();
            res.render('pages/admin/products/add', {
                errors,
                product,
                categories,
                title: 'Agregar producto'
            });
        }
        catch(e){
            return console.log(e);
        }
        
    }
    else{
        try{
            const p = await Product.findOne({slug: product.slug});
            if(p){
                req.flash('danger', 'El titulo existe para otro producto, por favor seleccione otro');
                const categories = await Category.find();
                res.render('pages/admin/products/add', {product, categories, title:'Agregar producto'});
            }
            else{
                let price2 = parseFloat(product.price).toFixed(2);
                product.price = price2;
                product.image = imageFile;
                const newProduct = new Product(product);
                await newProduct.save();
                await mkdirp.sync('public/images/products/'+newProduct._id);
                await mkdirp.sync('public/images/products/'+newProduct._id+"/gallery");
                await mkdirp.sync('public/images/products/'+newProduct._id+"/gallery/thumbs"); 

                if(imageFile!==""){
                    const productImage = req.files.image;
                    const path = 'public/images/products/'+newProduct._id+"/"+imageFile;
                    await productImage.mv(path);
                }

                req.flash('success', 'Producto agregado!');
                res.redirect('/admin/products'); 
            }
        }
        catch(e){
            return console.log(e);
        }
    }

};

productsController.editForm = async (req, res)=>{
    let errors;
    if(req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    try{
        const categories = await Category.find();
        const product = await Product.findById(req.params.id);

        const galleryDir = 'public/images/products/'+product._id + '/gallery';
        const galleryImages = await fse.readdirSync(galleryDir);

        product.category = product.category.replace(/\s+/g, '-').toLowerCase();

        let price2 = parseFloat(product.price).toFixed(2);
        product.price = price2;

        res.render('pages/admin/products/edit', {
            title: 'Editar producto', 
            product, 
            categories,
            errors,
            galleryImages
        })
    }
    catch(e){
        console.log(e);
        res.redirect('/admin/products');        
    }
};

productsController.editSave = async (req, res)=>{
    
    let imageFile = "";
    if(req.files!==null){
        imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : "";
    }

    req.checkBody('title', 'El titulo debe tener un valor').notEmpty();
    req.checkBody('descripcion', 'La descripcion debe tener un valor').notEmpty();
    req.checkBody('price', 'El precio debe tener un valor').isDecimal();
    req.checkBody('image', 'Debe cargar una imagen jpg/png').isImage(imageFile);

    const product = req.body;

    product.slug = product.title.replace(/\s+/g,'-').toLowerCase();

    try{
        const result = await req.getValidationResult();
        const errors = result.array();
        const id = req.params.id;
        if(errors.length>0){
            req.session.errors = errors;
            res.redirect('/admin/products/edit/'+id);
        }
        else{

            const p = await Product.findOne({slug: product.slug, _id: {'$ne':id}});
            if(p){
                req.flash('danger', 'El titulo existe para otro producto, por favor seleccione otro');
                res.redirect('/admin/products/edit/'+id);
            }
            else{
                const oldProduct = await Product.findById(id);
                oldProduct.title = product.title;
                oldProduct.slug = product.slug;
                oldProduct.descripcion = product.descripcion;
                oldProduct.price = parseFloat(product.price).toFixed(2);
                oldProduct.category = product.category;
                if(imageFile!==''){
                    oldProduct.image = imageFile;
                }

                await oldProduct.save();
                if(imageFile!==''){
                    if(product.prev_image!==''){
                        await fse.removeSync('public/images/products/'+id+'/'+product.prev_image);
                    }

                    const productImage = req.files.image;
                    const path = 'public/images/products/'+id+"/"+imageFile;
                    await productImage.mv(path);
                }

                req.flash('success','Producto modificado!');
                res.redirect('/admin/products/edit/'+id);

            }

        }

    }
    catch(e){
        return console.log(e);
    }


};

productsController.galleryUpload = async (req, res)=>{

    try{
        const productImage = req.files.file;
        const id = req.params.id;
        const path = 'public/images/products/'+id+'/gallery/'+productImage.name;
        const thumbsPath = 'public/images/products/'+id+'/gallery/thumbs/'+productImage.name;
        await productImage.mv(path);

        const buffer = await resize(fse.readFileSync(path), {width: 100, height: 100});
        await fse.writeFileSync(thumbsPath, buffer);

        res.sendStatus(200);

    }
    catch(e){
        return console.log(e);
    }

}

productsController.deleteImageGallery = async (req, res)=>{
    const id = req.query.id;
    const image = req.params.image;
    try{
        const originalImage = 'public/images/products/'+id+'/gallery/'+image;
        const thumbsImage = 'public/images/products/'+id+'/gallery/thumbs/'+image;

        await fse.removeSync(originalImage);
        await fse.removeSync(thumbsImage);

        req.flash('success','Imagen eliminada!');
        res.redirect('/admin/products/edit/'+id);
    }
    catch(e){
        return console.log(e);
    }

}

productsController.delete = async (req, res)=>{

    try{
        const id = req.params.id;
        const path = 'public/images/products/'+id;
        await fse.removeSync(path);
        await Product.findByIdAndRemove(id);
        req.flash('success', 'Producto eliminado!');
        res.redirect('/admin/products');
    }
    catch(e){
        return console.log(e);
    }

}

module.exports = productsController;
