$(document).ready(function() {
   
    $('input.verificationcode').keyup(function(){
        $('input.verificationcode').removeClass('nomatch');

        if($('input.verificationcode').val() == ''){
            $('button.verifyemail').attr('disabled', true)
        } else {
            $('button.verifyemail').attr('disabled', false)
        }
    })

    $('button.verifyemail').click(function(){
        var verificationDetails = {
            'verificationcode': $("input.verificationcode").val(),
            'email': $("input.email").val(),
        }

        $.ajax({
            type: 'POST',
            url: '/verifyemail',
            dataType: 'json',
            data: verificationDetails,
            success: function(data){
                if(!data.codeMatch){
                    alert('No Match');
                    $('input.verificationcode').addClass('nomatch');
                }
                if(data.noEmail){
                    $('div.errormsg').attr('hidden', false);
                }
                if(data.userVerified){
                    window.location.pathname = '/home'
                }
            }
        })
    });
});