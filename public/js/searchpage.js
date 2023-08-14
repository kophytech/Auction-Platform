$(document).ready(function(){
    $('div.loader-wrapper').fadeOut('slow');

    $('input.search').keyup(function(){
        if(!$('input.search').val() == '' ){
            $('section.body').css('display', 'none');
            $('section.search-content').css('display', 'block');
            $('section.search-content').html('');

            $.ajax({
                type: 'GET',
                url: `/search/${$('input.search').val()}`,
                success: function(data){
                    console.log(data.queryResults);

                    if(data.queryResults.length > 0){

                        data.queryResults.forEach(result => {
                            if(result.username != undefined){
                                $('section.search-content').append(`
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
                                $('section.search-content').append(`
                                    <a href='/auctions/${result.tag.substring(1)}'>
                                        <div class="result for-tag">
                                            <div class="icon"><i class="fa fa-hashtag"></i></div>
                                            <div class="name">
                                                <div class="username">${result.tag}</div>
                                                <div class="fullname">${ result.posts.length} posts</div>
                                            </div>
                                        </div>
                                    </a>
                                `);
                            }
                        });
                    } else {
                        $('section.search-content').html(`
                            <div class="noresult">
                                <div class="text">No results found.</div>
                            </div>
                        `);
                    }
                }
            });
        } else {
            $('section.body').css('display', 'block');
            $('section.search-content').css('display', 'none');
        }
    });

    fetchAllTags();

    function fetchAllTags(){
        $.ajax({
            type: 'GET',
            url: '/hashtags',
            success: function(data){
                for(var i =0; i < data.allhashtags.length; i++){
                    if(i == 0){
                        $('div.tags>div.list').append(`
                            <div class="atag ${i} current" onclick="fetchTagPosts('${i}', '${data.allhashtags[i].tag}')">#${data.allhashtags[i].tag}</div>
                        `);    
                    } else {
                        $('div.tags>div.list').append(`
                            <div class="atag ${i}" onclick="fetchTagPosts('${i}', '${data.allhashtags[i].tag}')">#${data.allhashtags[i].tag}</div>
                        `);
                    }
                }
                
                fetchTagPosts(0, data.allhashtags[0].tag);
            }
        });
    }
});

function fetchTagPosts(tagPosition, tagName){
    for(var i=0; i < 10; i++){
        $(`div.atag.${i}`).removeClass('current');
    }
    $(`div.atag.${tagPosition}`).addClass('current');
    
    $.ajax({
        type: 'GET',
        url: `/posts/${tagName}`,
        success: function(data){
            if(data.posts){
                for(var i = 0; i < 3; i++){
                    $(`div.photo_column.${i}`).html('');
                }

                var count = 1;

                data.posts.forEach(post=>{
                    if(count > 3) count = 1;

                    console.log(post);
                    $(`div.photo_column.${count}`).append(`
                        <div class="photo_frame">
                            <a href="/post/${post._id}">
                                <img src="/assets/postpictures/${post.image}">
                            </a>
                        </div>
                    `);
                });
            }
        }
    });
}

function detUserImage(userImage){
    if(userImage == undefined){
        return '<Img src="/assets/userpicture.png">';
    } else {
        return `<Img src="/assets/profilepictures/${userImage}">`;
    }
}
