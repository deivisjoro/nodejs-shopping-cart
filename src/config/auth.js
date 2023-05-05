exports.isUser = (req, res, next)=>{

    if(req.isAuthenticated()){
        next();
    }
    else{
        req.flash('danger', 'Por favor realice login');
        res.redirect('/users/login');
    }

}

exports.isAdmin = (req, res, next)=>{

    if(req.isAuthenticated() && res.locals.user.admin===1){
        next();
    }
    else{
        req.flash('danger', 'Por favor realice login como administrador');
        res.redirect('/users/login');
    }

}