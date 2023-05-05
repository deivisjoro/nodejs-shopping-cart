const Page = require('../../models/page');

const pagesController = {};


pagesController.index = async (req, res)=>{    
    try{

        const pages = await Page.find({}).sort({sorting: 1}).exec();
        res.render('pages/admin/pages/index', {pages, title: 'Listado de paginas'});

    }
    catch(error){
        return console.log(error);
    }            
};

pagesController.addForm = (req, res)=>{
    const page = {
        title: '',
        slug: '',
        content: ''
    };

    res.render('pages/admin/pages/add', {page, title: 'Agregar pagina'});
};

pagesController.addSave = async (req, res)=>{
    req.checkBody('title', 'El titulo debe tener un valor').notEmpty();
    req.checkBody('content', 'El contenido debe tener un valor').notEmpty();

    const page = req.body;

    page.slug = page.slug.replace(/\s+/g,'-').toLowerCase();

    if(page.slug==""){
        page.slug = page.title.replace(/\s+/g,'-').toLowerCase();
    }

    const result = await req.getValidationResult();
    const errors = result.array();
    
    if(errors.length>0){
        res.render('pages/admin/pages/add', {
            errors,
            page,
            title: 'Agregar pagina'
        });
    }
    else{
        try{
            const p = await Page.findOne({slug: page.slug});
            if(p){
                req.flash('danger', 'El slug existe para otra pagina, por favor seleccione otro');
                res.render('pages/admin/pages/add', {page, title:'Agregar pagina'});
            }
            else{
                page.sorting = 100;
                const newPage = new Page(page);
                await newPage.save();
                const pages = await Page.find({}).sort({sorting: 1}).exec();
                req.app.locals.pages = pages;
                req.flash('success', 'Pagina agregada!');
                res.redirect('/admin/pages');                
            }
        }
        catch(e){
            return console.log(e);
        }
    }

};

pagesController.reorder = async (req, res)=>{
    const ids = req.body['id[]']; //asi se llama el key que viene desde la tabla con jquery
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        count++;
        try{
            const page = await Page.findById(id);
            page.sorting = count;
            await page.save(); 
            res.send();
        }
        catch(e){
            return console.log(e);
        }
               
    }

    const pages = await Page.find({}).sort({sorting: 1}).exec();
    req.app.locals.pages = pages;

};

pagesController.editForm = async (req, res)=>{
    try{
        const page = await Page.findById(req.params.id);
        res.render('pages/admin/pages/edit', {title: 'Editar pagina', page})
    }
    catch(e){
        return console.log(e);
    }
};

pagesController.editSave = async (req, res)=>{
    req.checkBody('title', 'El titulo debe tener un valor').notEmpty();
    req.checkBody('content', 'El contenido debe tener un valor').notEmpty();

    const page = req.body;
    page._id = req.params.id;

    page.slug = page.slug.replace(/\s+/g,'-').toLowerCase();

    if(page.slug==""){
        page.slug = page.title.replace(/\s+/g,'-').toLowerCase();
    }

    const result = await req.getValidationResult();
    const errors = result.array();
    
    if(errors.length>0){
        res.render('pages/admin/pages/edit', {
            errors,
            page,
            title: 'Editar pagina'
        });
    }
    else{
        try{
            const p = await Page.findOne({slug: page.slug, _id:{'$ne': page._id}});
            if(p){
                req.flash('danger', 'El slug existe para otra pagina, por favor seleccione otro');
                res.render('pages/admin/pages/edit', {page, title:'Editar pagina'});
            }
            else{
                const p = await Page.findById(page._id);
                p.title = page.title;
                p.slug = page.slug;
                p.content = page.content;                
                
                await p.save();
                const pages = await Page.find({}).sort({sorting: 1}).exec();
                req.app.locals.pages = pages;
                req.flash('success', 'Pagina modificada!');
                res.redirect('/admin/pages/edit/'+p._id);               
            }
        }
        catch(e){
            return console.log(e);
        }
    }

};

pagesController.delete = async (req, res)=>{

    try{
        await Page.findByIdAndRemove(req.params.id);
        const pages = await Page.find({}).sort({sorting: 1}).exec();
        req.app.locals.pages = pages;
        req.flash('success', 'Pagina eliminada!');
        res.redirect('/admin/pages');
    }
    catch(e){
        return console.log(e);
    }

}

module.exports = pagesController;
