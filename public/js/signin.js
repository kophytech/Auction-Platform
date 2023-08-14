$(document).ready(function(){
    
    $('input').keyup(function(){
        $('div.errormsg').attr('hidden', true);

        if($('input.password').val() && $('input.userlogin').val()){
            $('button.submit').attr('disabled', false)
        } else {
            $('button.submit').attr('disabled', true)
        }
    });

    $('button.submit').click(function(){
        var userData = {
            'userlogin': $("input.userlogin").val(),
            'password': $("input.password").val(),
        }

        $.ajax({
            type: 'POST',
            url: '/api/signin',
            dataType: 'json',
            data: userData,
            success: function(data){
                if(!data.userFound && !data.passwordMatch){
                    $('div.errormsg').attr('hidden', false);
                    $('div.errormsg').html('User with the details doesn\'t exist.');
                }
                if(data.userFound && !data.passwordMatch){
                    $('div.errormsg').attr('hidden', false);
                    $('div.errormsg').html('Password is incorrect, if you can\'t remember try reseting it.');
                }
                if(data.sessionCreated && data.userFound && data.passwordMatch){
                    window.location.pathname = '/home'
                }
            }
        })
    });
});