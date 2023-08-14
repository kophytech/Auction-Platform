var sessionUser = $('input.user').val();

$(document).ready(function(){

    fetchAuctions();

    function fetchAuctions(){
        $('photo_column').html('');
        var allPhotoColumn = document.querySelectorAll('div.photo_column');
        var count = 1, position = 0;

        $.ajax({
            type: 'GET',
            url: '/posts',
            success: function(data){
                if(data.allPosts){
                    if(data.allPosts.length > 0 ){
                        data.allPosts.forEach(post => {
                            $.ajax({
                                type: 'GET',
                                url: `/userdetails/${post.user}`,
                                success: function(data){
                                    if(count > 3) count = 1;

                                    $(`div.photo_column.${count}`).append(`
                                        <div class="photo_frame">
                                            <img src="/assets/postpictures/${post.image}">
                                            <div class="info">
                                                <div class="top">
                                                    <a href="/user/${data.userdetails.username}">
                                                        <div class="user">
                                                            ${detUserImage(data.userdetails.image)}
                                                            <div class="name">${data.userdetails.username}</div>
                                                        </div>
                                                    </a>
                                                    <div class="date">
                                                        ${dateCreated(post.date)}
                                                    </div>
                                                </div>
                                                <a href="/post/${post._id}">
                                                    <div class="caption">
                                                        ${post.caption}
                                                    </div>
                                                </a>
                                            </div>
                                            <div class="actions">
                                                <div class="bids">
                                                    <a href="/post/${post._id}">
                                                        ${biddingStat(post)}
                                                    </a>
                                                </div>
                                                <div class="likeIcon ${count}"><div class="nooflikes">${post.likes.length}</div>${detLikedIcon(post, count)}</div>
                                            </div>
                                        </div>
                                    `);

                                    count++;
                                }
                            });
                        });
                    } else {
                        console.log('nothing');

                        $('section.all').html(`
                            <div class="noauction">Photos by other users you follow will appear here.</div>
                        `);
                    }
                }
                if(!data.allPosts){
                    $('section.all').html(`
                        <div class="noauction">Post by other users you follow will appear here.</div>
                    `);
                }
                if(data.errorOccurred){
                    $('section.all').html(`
                        <div class="noauction">Auction by other users you follow will appear here.</div>
                    `);
                }
            }
        });
    }

    function biddingStat(post){
        if(post.live == true){
            if(post.bids.length > 1) {
                return ` <div class="amount-of-bids">
                    <span class="no-of-bids">${post.bids.length-1}</span> bids at <span class="price">$${post.bids[post.bids.length-1].price}</span>
                </div>`;
            } else {
                return ` <div class="amount-of-bids">
                    Starting price <span class="price">$${post.bids[0].price}</span>
                </div>`;
            }
        } else {
            for(var i = 0; i < post.bids.length; i++){
                if(post.bids[i].winner == true){
                    return `<div class="amount-of-bids">
                        SOLD for <span class="price">$${post.bids[i].price}</span>
                    </div>`;
                }
            };
        }
    }

    function dateCreated(date){
        var currentDate = new Date();
        date = new Date(date);

        var timeInMilliseconds = currentDate.getTime() - date.getTime(),
        timeInSeconds = timeInMilliseconds / 1000,
        timeInMinutes = timeInSeconds / 60,
        timeInHours = timeInSeconds / 3600,
        timeInDays  = timeInHours / 24,
        timeInMonths  = timeInHours / 30,
        timeInYear  = timeInMonths / 12;

        if(timeInSeconds < 60){
            return `${Math.floor(timeInSeconds)}s`;
        } else if(timeInMinutes < 60){
        return `${Math.floor(timeInMinutes)}m`;
        } else if(timeInHours < 24){
            return `${Math.floor(timeInHours)}hr`;
        } else if(timeInDays < 30){
        return `${Math.floor(timeInDays)}days`;
        } else if(timeInMonths < 12){
            return `${Math.floor(timeInMonths)}mon`
        } else {
            return `${Math.floor(timeInYear)}yr`;
        }
    }

    function detUserImage(userImage){
        if(userImage == undefined){
            return '<Img src="/assets/userpicture.png">';
        } else {
            return `<Img src="/assets/profilepictures/${userImage}">`;
        }
    }
});