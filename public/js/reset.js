$(document).ready(function(){

    $('input.new').keyup(function(){
        if($('input.new').val() != $('input.confirm').val() || $('input.new').val() == '' || $('input.confirm').val() == ''){
            $('button.submit').attr('disabled', true)
            $('input.confirm').addClass('nomatch');
        }
        else {
            $('input.confirm').removeClass('nomatch');
            $('button.submit').attr('disabled', false)
        }
    });

    $('input.confirm').keyup(function(){
        if($('input.new').val() != $('input.confirm').val() || $('input.new').val() == '' || $('input.confirm').val() == ''){
            $('input.confirm').addClass('nomatch');
            $('button.submit').attr('disabled', true)
        }
        else {
            $('input.confirm').removeClass('nomatch');
            $('button.submit').attr('disabled', false)
        }
    });

    $('button.submit').click(function(){
       var newPassword = {
           email: $('input.email').val(),
           newpassword: $('input.new').val()
       } 

       $.ajax({
           type: 'POST',
           url: '/updatepassword',
           dataType: 'json',
           data: newPassword,
           success: function(data){
            if(data.passwordUpdated){
                window.location.pathname = '/resetcomplete'
            }
           } 
       });
    });
});