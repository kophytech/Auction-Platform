$(document).ready(function() {
   
    $('input.email').keyup(function(){
        $('input.email').removeClass('nomatch');

        if($('input.email').val() == ''){
            $('button.submit').attr('disabled', true)
        } else {
            $('button.submit').attr('disabled', false)
        }
    })

    $('button.submit').click(function(){
        var email = {
            'email': $("input.email").val(),
        }

        $.ajax({
            type: 'POST',
            url: '/recoverpassword',
            dataType: 'json',
            data: email,
            success: function(data){
              if(data.resetlinksent){
                  window.location.pathname = '/linksent'
              } 
              if(data.emailNotFound){
                $('div.errormsg').attr('hidden', false);
              }
              if(data.serverError){
                  alert('Server Error');
              }
            }
        })
    });
});