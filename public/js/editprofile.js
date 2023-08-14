$(document).ready(function(){
    
    var newProfilePicture;
  
    $('input#profilepic').change(function(){
        if(this.files && this.files[0]){
            var reader = new FileReader();
            reader.onload = function(e){
                $('.profilepicture').attr('src', e.target.result);
            }
            reader.readAsDataURL(this.files[0]);
            newProfilePicture = this.files[0];
        }
    });

    // $('button.updateprofile').click(function(){
    //     var userData = {
    //         'image': newProfilePicture,
    //         'email': $("input.email").val().trim(),
    //         'website': $("input.website").val().trim(),
    //         'country': $("input.country").val().trim(),
    //         'gender': $("select.gender").val().trim(),
    //         'bio': $("textarea").val().trim(),
    //     }

    //     $.ajax({
    //         type: 'POST',
    //         url: '/editprofile',
    //         dataType: 'multipart/form-data',
    //         data: userData,
    //         success: function(data){
    //             if(data.userData){
    //                 $('div.success').attr('hidden', true);
    //                 $('div.error').attr('hidden', false);
    //             } else {
    //                 $('div.error').attr('hidden', true);
    //                 $('div.success').attr('hidden', false);
    //             }
    //         }
    //     });

    // });

});