$(document).ready(function(){

    var user = {
        'username' : $('input.user').val()
    }

    fetchUserPhotos();

    $('div.users i.fa-times').click(function(){
        $('section.follow').attr('hidden', true).css('display', 'none');
    });

    $('section.follow>div.overlay').click(function(){
        $('section.follow').attr('hidden', true).css('display', 'none');
    });

    $('button.follow').click(function(){
            var userToFollow = {
                'username': $('input.user').val()
            }

            $.ajax({
                type: 'POST',
                url: '/followuser',
                dataType: 'json',
                data: userToFollow,
                success: function(data){
                    if(data.followedUser){

                        window.location.pathname = `/user/${userToFollow.username}`;
                    } else {
                        $('div.error').attr('hidden', false);
                    }
                },
                error: function(data){
                    console.log('Herror', data)
                }
            });
  
        });

    $('button.unfollow').click(function(){
        var userToUnfollow = {
            'username': $('input.user').val()
        }

        $.ajax({
            type: 'POST',
            url: '/unfollowuser',
            dataType: 'json',
            data: userToUnfollow,
            success: function(data){
                if(data.unfollowedUser){
                    window.location.pathname = `/user/${userToUnfollow.username}`;
                } else {
                    $('div.error').attr('hidden', false);
                }
            }
        });

    });

    function fetchUserPhotos(){
        var count = 1;

        $.ajax({
            type: 'GET',
            url: `/user/${user.username}/posts`,
            success: function(data){
                if(data.allUserPosts.length > 0){
                    data.allUserPosts.forEach(post => {
                        console.log(post);
                        if(count > 3) count = 1;
                        $(`div.photo_column.${count}`).append(`
                            <div class="photo_frame">
                                <a href="/post/${post._id}">
                                <img src="/assets/postpictures/${post.image}">
                                <div class="info">
                                   <a href="/post/${post._id}">
                                        <div class="bids">
                                            ${biddingStat(post)}
                                        </div>
                                        <div class="info-details">
                                            <div class="title">
                                                ${post.caption}
                                            </div>
                                        <div>
                                    </a>
                                </div> 
                                </a>
                            </div>
                        `);
                        count++;
                    });
                } else {
                    $('div.user-content').html(`
                        <div class="nopost">
                            <div class="text">
                                <i class="fa fa-image"></i>
                                No Photos
                            </div>
                        </div>
                    `);
                }
            },
            error: function(data){
                console.log(data)
            }
        });
    }

    function biddingStat(post){
        if(post.bids.length > 1) {
            return ` <div class="amount-of-bids">
            <span class="no-of-bids">${post.bids.length-1}</span> bids at <span class="price">$${post.bids[post.bids.length-1].price}</span>
        </div>`;
        } else {
            return ` <div class="amount-of-bids">
            Starting price <span class="price">$${post.bids[0].price}</span>
        </div>`;
        }
    } 

    $('div.all-photos').click(function(){
        fetchUserAuctions();
    });

    $('div.followers').click(function(){
        $.ajax({
            type: 'GET',
            url: `/user/${user.username}/followers`,
            success: function(data){
                if(data.userFollowers){
                    $('section.follow').attr('hidden', false).css('display', 'flex');
                    $('div.title>span').text('Followers');
                    $('div.users>div.list').html('');

                    data.userFollowers.forEach((follower)=>{

                        $.ajax({
                            type: 'GET',
                            url: `/fetchuser/${follower}`,
                            success: function(data){
                                if(data.user){
                                    $('section.follow>div.users div.list').append(`
                                        <div class="follower">
                                            <a href="/user/${follower}">
                                                <div>
                                                    ${detUserImage(data.user.image)}
                                                    <div class="name">${follower}</div>
                                                </div>
                                            </a>
                                            ${isUserFollowing(follower, data.userSession.following, data.userSession.username)}
                                        </div>
                                    `);
                                }
                            }
                        })
                    });
                } 
                if(data.userFollowers == '' && !data.error){
                    $('section.follow>div.users div.list').append(`
                       <div class="nofollower"> 
                            No Followers
                       </div>
                    `);
                }
                if(data.userFollowers == false && data.error){
                    $('div.user-content').append(`
                    <div class="nofollower">
                         Couldn't fetch user's followers
                    </div>
                 `);
                }
            }
        });
    });

    $('div.following').click(function(){
        $.ajax({
            type: 'GET',
            url: `/user/${user.username}/following`,
            success: function(data){
                if(data.userFollowing){
                    $('section.follow').attr('hidden', false).css('display', 'flex');
                    
                    $('div.title>span').text('Following');
                    $('div.users>div.list').html('');

                    data.userFollowing.forEach((following)=>{
                        $.ajax({
                            type: 'GET',
                            url: `/fetchuser/${following}`,
                            success: function(data){
                                if(data.user){
                                    $('section.follow>div.users div.list').append(`
                                            <div class="follower">
                                                <a href="/user/${following}">
                                                    <div>
                                                        ${detUserImage(data.user.image)}
                                                        <div class="name">${following}</div>
                                                    </div>
                                                </a>
                                                ${isUserFollowing(following, data.user.following, data.user.username)}
                                            </div>
                                    `);
                                }
                            }
                        })

                      
                    });
                } 
                if(data.userFollowing == '' && !data.error){
                    $('section.follow>div.users div.list').append(`
                       <div class="nofollower">
                            No following.
                       </div>
                    `);
                }
                if(data.userFollowing == false && data.error){
                    $('div.user-content').append(`
                    <div class="nofollower">
                         Couldn't fetch user's followers
                    </div>
                 `);
                }
            }
        });
    });

    function isUserFollowing(follower, myFollowing, sessionUser) {
        console.log(follower, myFollowing, sessionUser);

        if(sessionUser == follower) return '';
        else {
            if(myFollowing.includes(follower)){
                if(follower == sessionUser){
                    return '';
                } else {
                    return `<button class="unfollow-btn ${follower}" onclick="unfollowSpree('${follower}')">UnFollow</button>`;
                }
            } else {
                return `<button class="follow-btn ${follower}" onclick="followSpree('${follower}')">Follow</button>`;
            }
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