const Page = require('../../models/page');

const pagesController = {};


pagesController.home = async (req, res)=>{    
    try{        
        const page = await Page.findOne({slug: 'home'});

        res.render('pages/default/page', {
            title: 'Home',
            page
        });
    }
    catch(e){
        return console.log(e);
    }        
};

pagesController.page = async (req, res)=>{
    try{
        const slug = req.params.slug;
        const page = await Page.findOne({slug: slug});

        if(!page){
            res.redirect('/');
        }
        else{
            res.render('pages/default/page', {
                title: 'Pagina: '+page.title,
                page
            });
        }

    }
    catch(e){
        return console.log(e);
    }
};


module.exports = pagesController;
