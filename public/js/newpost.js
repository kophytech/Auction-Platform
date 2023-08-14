var tags = [];
var newAuctionPicture;

$(document).ready(function(){

    $('textarea.decoration').keyup(function(){
            enableButton();
    });

    $('input.tag').keyup(function(){
        $('div.msg').attr('hidden', true);
        $('div.tag-input').removeClass('exists');
        enableButton();
    });

    $('button.addtag').click(function(){
        var atag = `${$('input.tag').val().replace(/ /g, '').trim()}`;

        if(!tags.includes(atag)){
            tags.push(atag);

            $('div.alltags').html('');

            for(var i = 0; i < tags.length; i++){
                $('div.alltags').append(`
                <div class="atag" onclick="removeTag('${tags[i]}', '${i}')">
                    <div class="tag-name">#${tags[i]}</div>
                </div>
            `);

                $('textarea.alltags').val(tags)
            }
        } else {
            $('div.msg').attr('hidden', false);
            $('div.tag-input').addClass('exists');
        }

        enableButton();
   });
  
    $('input#profilepic').change(function(){
        if(this.files && this.files[0]){
            var reader = new FileReader();
            reader.onload = function(e){
                $('.profilepicture').attr('src', e.target.result);
                $('img.profilepicture').removeAttr('hidden');
            }
            reader.readAsDataURL(this.files[0]);
            newAuctionPicture = this.files[0];

            enableButton();
        }
    });

    $('input.startingprice').keyup(function(){
        enableButton();
    });
});

function enableButton(){
    console.log(newAuctionPicture);
    if($('textarea.description').val() == '' || $('input.startingprice').val() == ''  || newAuctionPicture == undefined || tags.length == 0 ){
        $('button.createauction').attr('disabled', true)
    } else {
        $('button.createauction').attr('disabled', false)
    }
}

function removeTag(tagName, index){
    tags.splice(index, 1);

    $('div.alltags').html('');

    for(var i = 0; i < tags.length; i++){
        $('div.alltags').append(`
            <div class="atag" onclick="removeTag('${tags[i]}', '${i}')">
                <div class="tag-name">${tags[i]}</div>
                <i class="fa fa-times deletetag"></i>
            </div>  
    `);
    }

    $('textarea.alltags').val(tags)

    enableButton();
}