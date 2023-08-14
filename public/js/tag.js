$(document).ready(function(){

    var tagTitle = $('input.tagtitle').val();

    fetchAuctions();

    function fetchAuctions(){
        $.ajax({
            type: 'GET',
            url: `/tag/${tagTitle}`,
            success: function(data){
                if(data.auctionByTag){
                    if(data.auctionByTag.length > 0 ){
                        data.auctionByTag.forEach(auction => { 
                            $.ajax({
                                type: 'POST',
                                url: '/auctioneer',
                                data: {auctioneerName: auction.auctioneerName},
                                success: function(data){
                                    $.ajax({
                                        type: 'POST',
                                        url: '/auctioneer',
                                        data: {auctioneerName: auction.auctioneerName},
                                        success: function(data){
                                            $('section.all').append(`
                                                <div class="auction-card">
                                                <div class="auctioneer">
                                                    <a href="/user/${data.auctioneer.username}">
                                                    <img src="/assets/profilepictures/${data.auctioneer.image}" alt="user image">
                                                    <div class="auctioneer-name">${data.auctioneer.username}</div>
                                                    </a>
                                                    <div class="date-created">
                                                        ${dateCreated(auction.date)}
                                                    </div>
                                                </div>
                    
                                                    <img src="/assets/auctionpictures/${auction.image}">
                    
                                                    <a href="/item/${auction._id}">
                                                        <div class="info">
                                                            <div class="hashtags">
                                                                ${auction.hashtags.join(' ')}
                                                            </div>
                                                            <div class="auction-title">${auction.title}</div>
                                                            <div class="description">
                                                                ${auction.description}
                                                            </div>
                                                            <div class="bidding-section">
                                                                <div class="amount-of-bids">
                                                                    <img src="/assets/auction_bid.png" alt="">
                                                                    <div class="number"><div class="figure">100 bids</div> <div class="text">with the highest at</div> <div class="figure">$4000</div></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>
                                        `);
                                        }
                                    });
                                }
                            });                  
                        });
                    }
                }
            }
        });
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
});