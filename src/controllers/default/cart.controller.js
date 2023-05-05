const cartController = {};

const Product = require('../../models/product');

cartController.add = async (req, res)=>{
    try{    
        const slug = req.params.producto;
        const product = await Product.findOne({slug: slug});
        if(product){
            let imagen = "";
            if(product.image===''){
                imagen = '/images/noimage.png';
            }
            else{
                imagen = '/images/products/'+product._id+'/'+product.image;
            }

            if(typeof req.session.cart === 'undefined'){
                req.session.cart = [];
                req.session.cart.push({
                    title: product.slug,
                    quantity: 1,
                    price: product.price,
                    image: imagen
                }); 

            }
            else{
                const cart = req.session.cart;
                let newItem = true;
                for(let i=0;i<cart.length;i++){
                    if(cart[i].title===slug){
                        cart[i].quantity++;
                        newItem = false;
                        break;
                    }
                }

                if(newItem){
                    cart.push({
                        title: product.slug,
                        quantity: 1,
                        price: product.price,
                        image: imagen
                    }); 
                }
            }
            req.flash('success', 'Producto agregado al carrito!');
            res.redirect('back');
        }
        else{
            res.redirect('/products');
        }

    }
    catch(e){
        return console.log(e);
    }        
};

cartController.checkout = async (req, res)=>{
    try{
        if(req.session.cart && req.session.cart.length===0){
            delete req.session.cart;
            res.redirect('/cart/checkout');
        }
        else{
            res.render('pages/default/checkout',{
                title: 'Carrito de compras',
                cart: req.session.cart
            });
        }        
    }
    catch(e){
        return console.log(e);
    }
};

cartController.update = async (req, res)=>{
    try{
        const slug = req.params.product;
        const cart = req.session.cart;
        const action = req.query.action;

        for (let i = 0; i < cart.length; i++) {
            if(cart[i].title===slug){
                switch (action) {
                    case 'add': cart[i].quantity++; break;
                    case 'remove': 
                        cart[i].quantity--; 
                        if(cart[i].quantity===0){
                            cart.splice(i, 1);  
                            if(cart.length===0){
                                delete req.session.cart;
                            }  
                        }
                    break;                   
                    case 'clear': 
                        cart.splice(i, 1);
                        if(cart.length===0){
                            delete req.session.cart;
                        } 
                    break;                
                    default:
                        res.redirect('/cart/checkout');
                    break;
                }
                break;
            }            
        }
        req.flash('success', 'Carrito actualizado!');
        res.redirect('back');
    }
    catch(e){
        return console.log(e);
    }
};

cartController.clear = async (req, res)=>{
    try{
        delete req.session.cart;
        req.flash('success', 'El carrito se ha limpiado!');
        res.redirect('back');
    }
    catch(e){
        return console.log(e);
    }
};

cartController.buynow = async (req, res)=>{
    try{
        delete req.session.cart;
        res.sendStatus(200);    
    }
    catch(e){
        return console.log(e);
    }
};


module.exports = cartController;
