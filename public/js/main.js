$(function(){

    if($('#ta').length){
        ClassicEditor
                .create( document.querySelector( '#ta' ) )
                .catch( error => {
                    console.error( error );
                } );
    }

    $('a.confirmarEliminacion').on('click', function(e){

        if(!confirm('Confirma la eliminacion?')){
            return false;
        }

    });

    if($('[data-fancybox]').length){
        $('[data-fancybox]').fancybox();
    }
});