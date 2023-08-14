$(document).ready(function() {

    $('input').keyup(function(){
        if(!$('input.username').hasClass('taken') && !$('input.email').hasClass('taken') && !$('input.email').val() == '' && !$('input.username').val() == '' && !$('input.fullname').val() == '' && !$('input.password').val() == '' && !$('select.country').val() == ''){
            $('button.submit').attr('disabled', false)
        } else {
            $('button.submit').attr('disabled', true)
        }
    });

    $('select.country').change(function(){
        if(!$('input.username').hasClass('taken') && !$('input.email').hasClass('taken') && !$('input.email').val() == '' && !$('input.username').val() == '' && !$('input.fullname').val() == '' && !$('input.password').val() == '' && !$('select.country').val() == ''){
            $('button.submit').attr('disabled', false)
        } else {
            $('button.submit').attr('disabled', true)
        }
    });

    $('input.email').keyup(function(){
        var email = {
            'email' : $("input.email").val()
        }

        $.ajax({
            type: 'POST',
            url: '/api/signup/checkemail',
            dataType: 'json',
            data: email,
            success: function(data){
                if(data.emailTaken){
                    $('input.email').addClass('taken');
                    if($('input.username').hasClass('taken') || $('input.email').hasClass('taken') || $('input.email').val() == '' || $('input.username').val() == '' || $('input.fullname').val() == '' || $('input.password').val() == '' || $('input.country').val() == ''){
                        $('button.submit').attr('disabled', true)
                    }
                } else {
                    $('input.email').removeClass('taken');
                    if(!$('input.username').hasClass('taken') && !$('input.email').hasClass('taken') &&
                        !$('input.email').val() == '' && !$('input.username').val() == '' & !$('input.fullname').val() == '' && !$('input.password').val() == '' && !$('input.country').val() == ''){
                        $('button.submit').attr('disabled', false)
                    }
                }
            },
            error: function(error){

            }
        })
    })

    $('input.username').keyup(function(){
        var username = {
            'username' : $("input.username").val()
        }

        $.ajax({
            type: 'POST',
            url: '/api/signup/checkusername',
            dataType: 'json',
            data: username,
            success: function(data){
                if(data.usernameTaken){
                    $('input.username').addClass('taken');
                    if($('input.username').hasClass('taken') || $('input.email').hasClass('taken') || $('input.email').val() == '' || !$('input.username').val() == '' || !$('input.fullname').val() == '' || !$('input.password').val() == '' || !$('input.country').val() == ''){
                        $('button.submit').attr('disabled', true)
                    }
                } else {
                    $('input.username').removeClass('taken');
                    if(!$('input.username').hasClass('taken') && !$('input.email').hasClass('taken') && !$('input.email').val() == '' && !$('input.username').val() == '' && !$('input.fullname').val() == '' && !$('input.password').val() == '' && !$('input.country').val() == ''){
                        $('button.submit').attr('disabled', false)
                    }
                }
            },
            error: function(error){

            }
        })
    })

    $('button.submit').click(function(){
        var userData = {
            'email': $("input.email").val().toLowerCase(),
            'fullname': $("input.fullname").val().toLowerCase(),
            'username': $("input.username").val().toLowerCase(),
            'password': $("input.password").val().toLowerCase(),
            'country': $("select.country").val().toLowerCase(),
        }

        $.ajax({
            type: 'POST',
            url: '/api/createaccount',
            dataType: 'json',
            data: userData,
            success: function(data){
                if(data.emailTaken){
                    $('input.email').addClass('taken');
                }
                if(data.usernameTaken){
                    $('input.username').addClass('taken');
                }
                if(data.userCreated){
                    window.location.pathname = '/home'
                }
            }
        })
    });

});