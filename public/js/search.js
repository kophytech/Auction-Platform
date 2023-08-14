$(document).ready(function(){
    $('div.loader-wrapper').fadeOut('slow');

    $('input.search').keyup(function(){
        var searchQuery = $('input.search').val();

        if(searchQuery != ''){
            $('div.search-content').css('display', 'block');

            if(searchQuery){
                $.ajax({
                    type: 'GET',
                    url: `/search/${searchQuery}`,
                    success: function(data){
                        if(data.queryResults.length > 0){
                            $('div.search-content').html('');

                            data.queryResults.forEach(result => {
                                if(result.username != undefined){
                                    $('div.search-content').append(`
                                        <a href="/user/${result.username}">
                                            <div class="result for-user">
                                                ${detUserImage(result.image)}
                                                <div class="name">
                                                    <div class="username">${result.username}</div>
                                                    <div class="fullname">${result.fullname}</div>
                                                </div>
                                            </div>
                                        </a>
                                    `);
                                } else {
                                    $('div.search-content').append(`
                                        <a href='/auctions/${result.tag}'>
                                            <div class="result for-tag">
                                                <div class="icon"><i class="fa fa-hashtag"></i></div>
                                                <div class="name">
                                                    <div class="username">${result.tag}</div>
                                                    <div class="fullname">${result.posts.length} posts</div>
                                                </div>
                                            </div>
                                        </a>
                                    `);
                                }
                            });
                        } else {
                            $('div.search-content').html(`
                                <div class="noresult">
                                    <div class="text">No results found.</div>
                                </div>
                            `);
                        }
                    },
                });
            }
        } else {
            $('div.search-content').css('display', 'none');
        }
    });

    function detUserImage(userImage){
        if(userImage == undefined){
            return '<Img src="/assets/userpicture.png">';
        } else {
            return `<Img src="/assets/profilepictures/${userImage}">`;
        }
    }

    $('div.header > div.back').click(function(){
        history.back();
    });
});

$(document).click(function(e){
    if($('i.options-indicator').hasClass('fa-caret-up')){
        $('i.options-indicator').removeClass('fa-caret-up');
        $('i.options-indicator').addClass('fa-caret-down')

        $('div.user-profile-options').attr('hidden', true);
    } else {
        if(e.target == $('div.user-profile > button.with-image')[0] || e.target == $('div.user-profile > button.without-image')[0] || e.target.id == 'user-profile'){
            if($('i.options-indicator').hasClass('fa-caret-down')){
                $('i.options-indicator').removeClass('fa-caret-down');
                $('i.options-indicator').addClass('fa-caret-up');

                $('div.user-profile-options').removeAttr('hidden')
            } else {
                $('i.options-indicator').removeClass('fa-caret-up');
                $('i.options-indicator').addClass('fa-caret-down')

                $('div.user-profile-options').attr('hidden', true);
            }
        }
    }
});
