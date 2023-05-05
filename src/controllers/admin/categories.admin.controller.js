const Category = require('../../models/category');

const categoriesController = {};


categoriesController.index = async (req, res)=>{    
    try{
        const categories = await Category.find();
        res.render('pages/admin/categories/index', {categories, title: 'Listado de categorias'});
    }
    catch(error){
        return console.log(error);
    }            
};

categoriesController.addForm = (req, res)=>{
    const category = {
        title: ''
    };

    res.render('pages/admin/categories/add', {category, title: 'Agregar categoria'});
};

categoriesController.addSave = async (req, res)=>{
    req.checkBody('title', 'El titulo debe tener un valor').notEmpty();

    const category = req.body;

    category.slug = category.title.replace(/\s+/g,'-').toLowerCase();

    const result = await req.getValidationResult();
    const errors = result.array();
    
    if(errors.length>0){
        res.render('pages/admin/categories/add', {
            errors,
            category,
            title: 'Agregar categoria'
        });
    }
    else{
        try{
            const c = await Category.findOne({slug: category.slug});
            if(c){
                req.flash('danger', 'El titulo existe para otra categoria, por favor seleccione otro');
                res.render('pages/admin/categories/add', {category, title:'Agregar categoria'});
            }
            else{
                const newCategory = new Category(category);
                await newCategory.save();
                const categories = await Category.find();
                req.app.locals.categories = categories;
                req.flash('success', 'Categoria agregada!');
                res.redirect('/admin/categories');                
            }
        }
        catch(e){
            return console.log(e);
        }
    }

};

categoriesController.editForm = async (req, res)=>{
    try{
        const category = await Category.findById(req.params.id);
        res.render('pages/admin/categories/edit', {title: 'Editar categoria', category})
    }
    catch(e){
        return console.log(e);
    }
};

categoriesController.editSave = async (req, res)=>{
    req.checkBody('title', 'El titulo debe tener un valor').notEmpty();

    const category = req.body;
    category.slug = category.title.replace(/\s+/g,'-').toLowerCase();
    category._id = req.params.id;

    const result = await req.getValidationResult();
    const errors = result.array();
    
    if(errors.length>0){
        res.render('pages/admin/categories/edit', {
            errors,
            category,
            title: 'Editar categoria'
        });
    }
    else{
        try{
            const c = await Category.findOne({slug: category.slug, _id:{'$ne': category._id}});
            if(c){
                req.flash('danger', 'El titulo existe para otra categoria, por favor seleccione otro');
                res.render('pages/admin/categories/edit', {category, title:'Editar categoria'});
            }
            else{
                const c = await Category.findById(category._id);
                c.title = category.title;
                c.slug = category.slug;               
                
                await c.save();
                const categories = await Category.find();
                req.app.locals.categories = categories;
                req.flash('success', 'Categoria modificada!');
                res.redirect('/admin/categories/edit/'+c._id);               
            }
        }
        catch(e){
            return console.log(e);
        }
    }

};

categoriesController.delete = async (req, res)=>{

    try{
        await Category.findByIdAndRemove(req.params.id);
        const categories = await Category.find();
        req.app.locals.categories = categories;
        req.flash('success', 'Categoria eliminada!');
        res.redirect('/admin/categories');
    }
    catch(e){
        return console.log(e);
    }

}

module.exports = categoriesController;
