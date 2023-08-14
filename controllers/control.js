const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const paypal = require('paypal-rest-sdk');
// const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');


const User = require('../models/users.js');
const Verification = require('../models/verification.js');
const PasswordReset = require('../models/passwordReset.js');
const Post = require('../models/posts.js');
const Hashtags = require('../models/hashtags.js');
const Chat = require('../models/chat.js');
const { render } = require('ejs');
const { errorMonitor } = require('events');

const saltRounds = 10;

//set storage engine for images uploaded
var profilePictureName;
const profilePictureStorage = multer.diskStorage({
    destination: './public/assets/profilepictures',
    filename: function(req, file, cb){
        profilePictureName =  file.fieldname + req.session.user.username + '-' + Date.now() + path.extname(file.originalname);
        cb(null, profilePictureName);
    }
})

var postPictureName;
const postPictureStorage = multer.diskStorage({
    destination: './public/assets/postpictures',
    filename: function(req, file, cb){
        postPictureName =  file.fieldname + req.session.user.username + '-' + Date.now() + path.extname(file.originalname);
        cb(null, postPictureName);
    }
})

//initialize upload
const profilePictureUpload = multer({storage: profilePictureStorage}).single('profilepicture');

const postPictureUpload = multer({storage: postPictureStorage}).single('postpicture');

module.exports=(server)=> {
    server.use(session({secret: "k3y!ss3cr3t", resave: false, saveUninitialized: true}));

    var verificationEmail;

    //ROUTES TO GET PAGES AND DATA

    server.get('/', (req, res)=>{
        res.render('index', {userSession: req.session.user});
    });

    server.get('/signin', (req, res)=>{
        if(req.session.user){
            res.redirect('home');
        } else {
            res.render('signin');
        }
    });

    server.get('/signup', (req, res)=>{
        if(req.session.user){
            res.redirect('home');
        } else {
            res.render('signup');
        }
    });

    // server.get('/verifyemail', (req, res)=>{
    //     res.redirect('/signup');
    // });

    // server.get('/initiateVerification', (req, res)=>{
    //     if(req.session.user){
    //         res.redirect('/home');
    //     } else {
    //         res.render('verifyemail', {email: verificationEmail});

    //         var codeDigits  = Math.floor(100000 + Math.random() * 900000);
    //         var verification = new Verification({
    //             email: verificationEmail,
    //             code: codeDigits.toString()
    //         });

    //        Verification.deleteOne({email: verificationEmail}, (err, deleted)=>{
    //             if(verification.save()){
    //                 var mailTransporter = nodemailer.createTransport({
    //                     service: 'gmail',
    //                     auth: {
    //                         user: 'auctionproject2020@gmail.com',
    //                         pass: 'frenzyiscalm'
    //                     }
    //                 });

    //                 var mailDetails = {
    //                     from: 'auctionproject2020@gmail.com',
    //                     to: verificationEmail,
    //                     subject: `${codeDigits.toString()} is your Bidall code`,
    //                     html: `<html>
    //                     <style>
    //                         section{

    //                         }
    //                         div.logo{

    //                         }
    //                         div.content{

    //                         }
    //                         p{
    //                             padding: 1% 0%;
    //                             font-size: 126%;
    //                         }
    //                         div.code{

    //                         }
    //                     </style>
    //                     <body>
    //                         <section style='padding: 0% 2%; color: grey;'>
    //                             <div style="border-bottom: 1px solid rgb(228, 228, 228); font-size: 200%; padding: 3% 0%; font-weight: 700; color: black;">AUCTION</div>
    //                             <div style="font-size: 140%;">
    //                                 <p>Hi,</p>
    //                                 <p>Someone tried to sign up for a Bidall account with ${verificationEmail}. If it was you, enter this confirmation code in the app:</p>
    //                                 <div style="font-size: 200%; width: 100%; text-align: center; font-weight: 500;">${codeDigits.toString()}</div>

    //                                 <div style="margin: 10% 0% 0% 0%; font-size: 80%">
    //                                     <span>from</span><br>
    //                                     <span style="color: black; font-weight: 500;">BIdall</span>
    //                                 </div>
    //                             </div>
    //                         </section>
    //                     </body>
    //                 </html>`
    //                 }
    //                 mailTransporter.sendMail(mailDetails, function(err, data){
    //                     if(err){
    //                         console.log('Error Occurs', err);
    //                     } else {
    //                         console.log('Email sent successfully.');
    //                     }
    //                 })
    //             }
    //        });
    //     }
    // });

    server.get('/forgotpassword', (req, res)=>{
        res.render('forgotpassword');
    });

    server.get('/home', (req, res)=>{
        if(req.session.user){
            res.render('home', {userSession: req.session.user});
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/user/:name', (req, res)=>{
        if(req.session.user){
            User.findOne({username: req.params.name}, (err, userData)=>{
                if(err){
                    console.log('There was an error fetching the user');
                }
                if(userData){
                    console.log(userData);
                    res.render('userpage', {userSession: req.session.user, user: userData});
                }
                if(!userData){
                    res.render('nouser');
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/editprofile', (req, res)=>{
        if(req.session.user){
            User.findOne({username: req.session.user.username}, (err, userData)=>{
                if(err){
                    console.log('There was an error fetching the user');
                }
                if(userData){
                    res.render('editprofile', {userSession: req.session.user, user: userData});
                }
                if(!userData){
                    res.render('nouser');
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/userdetails/:name', (req, res)=>{
        if(req.session.user){
            User.findOne({username: req.params.name}, (err, userData)=>{
                if(err){
                    res.send({userdetails: false, errorOccurred: true});
                }
                if(userData){
                    console.log(userData);
                    res.send({userdetails: userData, errorOccurred: false});
                }
                if(!userData){
                    res.send({userdetails: false, errorOccurred: false});
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/explore', (req, res)=>{
        if(req.session.user){
            res.render('explore', {userSession: req.session.user});
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/posts', (req, res)=>{
        if(req.session.user){
            Post.find({$or: [
                {user: req.session.user.username},
                {user: {$in: req.session.user.following}}
            ]}, (err, foundPost)=>{
                if(foundPost){
                    res.send({allPosts: foundPost.reverse(), errorOccurred: false});
                }
                if(!foundPost){
                    res.send({allPosts: false, errorOccurred: false});
                }
                if(err){
                    res.send({allPosts: false, errorOccurred: true});
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/post/:id', (req, res)=>{
        if(req.session.user){
            Post.findById({_id: req.params.id}, (err, foundPost)=>{
                if(foundPost){
                    User.findOne({username: foundPost.user}, (err, foundUser)=>{
                        if(foundUser){
                            res.render('post', {post: foundPost, user: foundUser, userSession: req.session.user});
                        }
                    });
                } else {

                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/newpost', (req, res)=>{
        if(req.session.user){
            res.render('newpost', {userSession: req.session.user});
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/user/:name/posts', (req, res)=>{
        if(req.session.user){
            Post.find({user: req.params.name}, (err, foundPosts)=>{
                if(foundPosts){
                    res.send({allUserPosts: foundPosts.reverse(), errorOccurred: false});
                }
                if(!foundPosts){
                    res.send({allUserPosts: false, errorOccurred: false});
                }
                if(err){
                    res.send({allUserPosts: false, errorOccurred: true});
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/user/:name/followers', (req, res)=>{
        if(req.session.user){
            User.findOne({username: req.params.name}, (err, userData)=>{
                if(err){
                    res.send({userFollowers: false, error: true})
                }
                if(userData){
                    res.send({userFollowers: userData.followers, user: req.session.user, error: false});
                }
                if(!userData){
                    res.send({userFollowers: false, error: false})
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/user/:name/following', (req, res)=>{
        if(req.session.user){
            User.findOne({username: req.params.name}, (err, userData)=>{
                if(err){
                    res.send({userFollowing: false, error: true})
                }
                if(userData){
                    res.send({userFollowing: userData.following, user: req.session.user, error: false});
                }
                if(!userData){
                    res.send({userFollowing: false, error: false})
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/fetchuser/:username', (req, res)=>{
        if(req.session.user){
            User.findOne({username: req.params.username}, (err, foundUser)=>{
                if(foundUser){
                    res.send({user: foundUser, userSession: req.session.user});
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/auctions/:title', (req, res)=>{
        if(req.session.user){
            Post.find({hashtags: req.params.title}, (err, foundPosts)=>{
                if(err){
                    console.log('Error happened');
                } else res.render('tag', {userSession: req.session.user, tagInfo: {tag: req.params.title, count: foundPosts.length}, tagPosts: foundPosts});
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/reset/:email/:code', (req, res)=>{
        var link = `${req.params.email}/${req.params.code}`;
        PasswordReset.findOne({resetLink: link}, (err, foundItem)=>{
            if(foundItem){
                res.render('reset', {userEmail: req.params.email});
            }
            if(!foundItem){
                console.log('Link doesnt exist');
            }
            if(err){
                console.log('error');
            }
        });

    });

    server.get('/signout', (req, res)=>{
        req.session.destroy();
        console.log('Session Destroyed');
        res.redirect('/signin');
    });

    server.get('/resetcomplete', (req, res)=>{
        res.render('resetcomplete');
    });

    server.get('/search', (req, res)=>{
        if(req.session.user){
            res.render('search', {userSession: req.session.user});
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/search/:query', (req, res)=>{
        if(req.session.user){
            var query = req.params.query.toLowerCase();
            console.log(query);

            User.find({username: {$regex: new RegExp(query)}}, (err, foundUsers)=>{
                if(foundUsers){
                    Hashtags.find({tag: {$regex: new RegExp(query)}}, (err, foundHashTags)=>{
                        if(foundHashTags){
                            foundHashTags.forEach(foundHashTag=>{
                                foundUsers.push(foundHashTag)
                            })
                            res.send({queryResults: foundUsers});
                        }
                        if(err){

                        }

                    });
                }
                if(!foundUsers){
                    console.log('No User Found');
                }
                if(err){
                    console.log('There was an error');
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/hashtags', (req, res)=>{
        if(req.session.user){
            Hashtags.find({}).sort({count: -1}).limit(10).exec((err, foundHashtags)=>{
                if(foundHashtags){
                    res.send({allhashtags: foundHashtags, error: false});
                } else {
                    res.send({allhashtags: false, error: true});
                }
            })
        } else {

        }
    });

    server.get('/posts/:tag', (req, res)=>{
        if(req.session.user){
            Post.find({hashtags: req.params.tag}, (err, foundPosts)=>{
                if(foundPosts){
                    res.send({posts: foundPosts});
                }
                if(!foundPosts){
                    console.log('foundnothing');
                }
                if(err){
                    console.log('Error happened');
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/fetchbids/:post', (req, res)=>{
        if(req.session.user){
            Post.findById({_id: req.params.post}, (err, foundPost)=>{
                if(foundPost){
                    res.send({allBids: foundPost.bids, errorOccurred: false});
                }
            });
        } else {

        }
    });

    server.get('/deletebid/:bidid/:post', (req, res)=>{
        if(req.session.user){
            Post.findByIdAndUpdate({_id: req.params.post}, {$pull: {bids: {_id: req.params.bidid}}}, {upsert: true, useFindAndModify: false}, async (err, deleted)=>{
                if(deleted){
                   await deleted.bids.forEach(bid=>{
                        if(bid._id == req.params.bidid && bid.winner == true ){
                            Post.findByIdAndUpdate({_id: req.params.post}, {live: true}, (err, updated)=>{
                                if(updated){
                                    console.log('THe winner deleted');
                                }
                            });
                        }
                    });

                    Post.findById({_id: req.params.post}, (err, found)=>{
                        if(found){
                            res.send({bidDeleted: true, noofbids: found.bids.length - 1, isLive: found.live});
                        }
                    });
                }
            });
        } else {

        }
    });

    server.get('/chatroom/:chatroomid', (req, res)=>{
        if(req.session.user){
            Chat.findById({_id: req.params.chatroomid}, (err, foundChatRoom)=>{
                if(foundChatRoom.user == req.session.user.username || foundChatRoom.bidWinner == req.session.user.username){
                    req.session.chatroomid = req.params.chatroomid;
                    if(req.session.user.username == foundChatRoom.user){
                        User.findOne({username: foundChatRoom.bidWinner}, (err, foundUser)=>{
                            if(foundUser){
                                res.render('chatroom', {userSession: req.session.user, chatData: foundChatRoom, recipient: foundUser});
                            }
                        });
                    }
                    if(req.session.user.username == foundChatRoom.bidWinner){
                        User.findOne({username: foundChatRoom.user}, (err, foundUser)=>{
                            res.render('chatroom', {userSession: req.session.user, chatData: foundChatRoom, recipient: foundUser});
                        });
                    }
                } else {
                    res.redirect('/home');
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/chatroom/messages/:chatroomid', (req, res)=>{
        if(req.session.user){
            Chat.findById({_id: req.params.chatroomid}, (err, foundChatRoom)=>{
                if(foundChatRoom){
                    res.send({userSession: req.session.user, messages: foundChatRoom.messages});
                }
            })
        } else {

        }
    })

    server.get('/chatroom/messages/:chatroomid', (req, res)=>{
        if(req.session.user){
            Chat.findById({_id: req.params.chatroomid}, (err, foundChatRoom)=>{
                if(foundChatRoom){
                    res.send({userSession: req.session.user, messages: foundChatRoom.messages});
                }
            });
        } else {

        }
    })

    server.get('/success', (req, res)=>{
        if(req.session.user){
            User.findOneAndUpdate({username: req.session.user.username}, {subscribed: true}, {upsert: true, useFindAndModify: false}, (err, updatedUser)=>{
                if(updatedUser){
                    User.findOne({username: req.session.user.username}, (err, foundUser)=>{
                        if(foundUser){
                            req.session.user = foundUser;
                            res.redirect(`/chatroom/${req.session.chatroomid}`);
                        }
                    });
                } else {
                    console.log('ERROR');
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/dashboard', (req, res)=>{
        if(req.session.user != undefined) {
            if(req.session.user.username == 'admin'){
                User.find((err, foundUsers) => {
                    if(err){

                    } else if (foundUsers){
                        res.render('dashboard', {userSession: req.session.user, allUsers: foundUsers, error: false});
                    } else {

                    }
                });
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/deleteUser/:userid', (req, res)=>{
        if(req.session.user != undefined) {
            if(req.session.user.username == 'admin'){
               User.findOneAndDelete({_id: req.params.userid}, (err, deletedUser)=>{
                   if(err){
                        res.send({userDeleted: false, error: true});
                   } else if(!deletedUser) {
                        res.send({userDeleted: true, error: false});
                   } else {
                        res.send({userDeleted: true, error: false});
                   }
               });
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/signin');
        }
    });

    server.get('/metrics/users', (req, res)=>{
        if(req.session.user != undefined) {
            if(req.session.user.username == 'admin'){
                User.find((err, foundData) => {
                    if(err) {
                        res.send({userCount: false, error: true});
                    }
                    if(!foundData) res.send({userCount: foundData.length, error: false});
                    else{
                        res.send({userCount: foundData.length, error: false});
                    }
                });
            } else {
                console.log('hey');
            }
        } else {

        }
    });

    server.get('/metrics/posts', (req, res)=>{
        if(req.session.user != undefined) {
            if(req.session.user.username == 'admin'){
                Post.find((err, foundData) => {
                    if(err) {
                        res.send({postCount: false, error: true});
                    }
                    if(!foundData) res.send({postCount: foundData.length, error: false});
                    else{
                        res.send({postCount: foundData.length, error: false});
                    }
                });
            } else {
                console.log('hey');
            }
        } else {

        }
    });

    server.get('/metrics/chatrooms', (req, res)=>{
        if(req.session.user != undefined) {
            if(req.session.user.username == 'admin'){
                Chat.find((err, foundData) => {
                    if(err) {
                        res.send({chatCount: false, error: true});
                    }
                    if(!foundData) res.send({chatCount: foundData.length, error: false});
                    else{
                        res.send({chatCount: foundData.length, error: false});
                    }
                });
            } else {
                console.log('hey');
            }
        } else {

        }
    });

    server.get('/deletepost/:postid', (req, res)=>{
        if(req.session.user.username == 'admin') {
            Post.findOneAndDelete({_id: req.params.postid}, (err, deletedPost)=>{
                if(err){
                    res.send({authorizedAccess: true, postDeleted: false, error: true});
                } else if(!deletedPost) {
                    res.send({authorizedAccess: true, postDeleted: false, error: false});
                } else {
                    User.findOneAndUpdate(
                        {username: deletedPost.user},
                        {$pull: {posts: deletedPost._id.toString()}},
                        {new: true},
                        (updateUserErr, updatedUser)=>{
                            if(updateUserErr){
                                console.log(`There was an error updating user account ${updatedUser.username} by removing the deleted post with ID ${deletedPost._id}.`);
                            } else {
                                if(updatedUser){
                                    for(var i = 0; i < deletedPost.hashtags.length; i++){
                                        var currentHashtag = deletedPost.hashtags[i];
                                         
                                        Hashtags.findOne({tag: currentHashtag}, (err, foundHashTag)=>{
                                            if(foundHashTag){
                                                if(foundHashTag.posts.length > 1){

                                                    Hashtags.findOneAndUpdate(
                                                        {tag: currentHashtag},
                                                        {$pull: {posts: deletedPost.id, users: deletedPost.user}, $set: {count: foundHashTag.count-1}},
                                                        {new: true},
                                                        (err, updatedHashTag)=>{
                                                            if(updatedHashTag){
                                                                console.log(`Post ${deletedPost._id} has been unlinked from tag ${updatedHashTag.tag}`);
                                                            } else{
                                                                if(err) console.log(`There was an error unlinking post ${deletedPost._id} from tag ${updatedHashTag.tag}`);
                                                            }
                                                        }
                                                    );

                                                } else {

                                                    Hashtags.findOneAndDelete(
                                                        {tag: currentHashtag}, (err, deletedHashTag)=>{
                                                            if(deletedHashTag){
                                                                console.log(`Hashtag ${deletedHashTag._id} has been deleted.`);
                                                            } else {
                                                                if(err) console.log(`There was an error deleting hashtag ${deletedHashTag}.`);
                                                            }
                                                        }
                                                    );
                                                    
                                                }
                                            } else {
                                                console.log(`Hashtag ${currentHashtag} doesnt exist.`);
                                            }
                                        });
                                        
                                        if(i == deletedPost.hashtags.length-1){
                                            res.send({authorizedAccess: true, postDeleted: true, error: false});
                                        }
                                    }
                                } else {
                                    console.log(`Could not update user account ${updatedUser.username} by removing the deleted post with ID ${deletedPost._id}.`);
                                }
                            }
                        }
                    );
                }
            });
        } else {
            res.send({authorizedAccess: false, postDeleted: false, postFound: true, error: false});
        }
    });


    //ROUTES TO POST DATA

    server.post('/updatepassword', (req, res)=>{
        bcrypt.hash(req.body.newpassword, saltRounds, (err, hashPassword)=>{
            var newpassword = hashPassword

            User.findOneAndUpdate({email: req.body.email}, {password: newpassword}, {upsert: true, useFindAndModify: false}, (err, userData)=>{
                if(userData){
                    console.log('Password changed to ', newpassword);
                    PasswordReset.deleteOne({email: req.body.email}, (err, deleted)=>{
                        if(deleted){
                            res.send({passwordUpdated: true});
                        }
                        if(!deleted){
                            res.send({passwordUpdated: false});
                        }
                        if(err){
                            res.send({passwordUpdated: false});
                        }
                    });
                }
                if(!userData){
                    console.log('Password wasnt changed', newpassword);
                }
                if(err){
                    console.log('Error Occurred');
                }
            });
        });
    });

    server.post('/unfollowuser', (req, res)=>{
        if(req.session.user){
            User.findOneAndUpdate({username: req.body.username}, {$pull: {followers: req.session.user.username}}, {upsert: true, useFindAndModify:false}, (err, updatedFollower)=>{
                if(updatedFollower){
                    User.findOneAndUpdate({username: req.session.user.username}, {$pull: {following: updatedFollower.username}}, {useFindAndModify:false}, (err, updatedUser)=>{
                        if(updatedUser){
                            User.findOne({username: req.session.user.username}, (err, user)=>{
                                if(user){
                                    req.session.user = user;
                                    console.log(req.session.user.following);
                                    res.send({unfollowedUser: true, noOfMyFollowing: user.following.length, sessionUser: user.username});
                                }
                            });
                        }
                        if(!updatedUser){
                            console.log('User wasnt unfollowed');
                        }
                    });
                }
                if(!updatedFollower) {
                    res.send({unfollowedUser: false});
                }
            })
        } else {

        }
    });

    server.post('/auctioneer', (req, res)=>{
        if(req.session.user){
            User.findOne({username: req.body.auctioneerName}, (err, foundUser)=>{
                if(foundUser){
                    // console.log('Auction is available');
                    res.send({auctioneer: foundUser, errorOccurred: false});
                }
                if(!foundUser){
                    // console.log('No auction');
                    res.send({auctioneer: foundUser,  errorOccurred: false});
                }
                if(err){
                    // console.log('Error');
                    res.send({auctioneer: foundUser,  errorOccurred: true});
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.post('/editprofile', (req, res)=>{
        if(req.session.user){
            profilePictureUpload(req, res, (err)=>{
                if(err){
                    console.log('error', err);
                } else {
                    User.findOneAndUpdate({email: req.body.email}, {image: profilePictureName, website: req.body.website, country: req.body.country, gender: req.body.gender, bio: req.body.bio}, {upsert: true, useFindAndModify: false}, (err, userData)=>{
                        if(userData){
                            User.findOne({email: userData.email}, (err, foundUser)=>{
                                if(foundUser){
                                    // req.session.destroy();
                                    req.session.user = foundUser;
                                    res.redirect(`/user/${foundUser.username}` );
                                }
                                if(!foundUser){

                                }
                                if(err){

                                }
                            });
                        }
                        if(!userData){
                            res.redirect('/editprofile');
                        }
                    });
                }
            });
        } else {
            res.redirect('/signin');
        }
    });

    server.post('/createpost', (req, res)=>{
        if(req.session.user){
            postPictureUpload(req, res, (err)=>{
                 var newPost = new Post({
                    user: req.session.user.username,
                    hashtags: req.body.hashtags.split(','),
                    caption: req.body.caption,
                    date: Date.now(),
                    image: postPictureName,
                    live: true,
                    bids:{
                        bidder: req.session.user.username,
                        price: req.body.startingprice,
                        date: new Date()
                    }
                });

                newPost.save((err, savedPost)=>{
                    if(savedPost){
                        User.findOneAndUpdate({username: req.session.user.username},  {$push: {posts: savedPost.id}}, {useFindAndModify: false}, (err, updatedUser)=>{
                            if(updatedUser){
                                savedPost.hashtags.forEach(hashtag =>{
                                    Hashtags.findOne({tag: hashtag}, (err, foundHashtag)=>{
                                        if(foundHashtag){
                                            Hashtags.findOneAndUpdate({_id: foundHashtag.id}, {$push: {posts: savedPost.id, users: req.session.user.username}, count: ++foundHashtag.count}, {upsert: true, useFindAndModify: false}, (err, updatedHashtag)=>{
                                                if(updatedHashtag){
                                                    console.log(`Hashtag with tag ${updatedHashtag.tag} has been updated by ${req.session.user.username}`);
                                                }
                                            });
                                        } else {
                                            var firstUserToSave = [], firstAuctionToSave = [];
                                            firstUserToSave.push(req.session.user.username);
                                            firstAuctionToSave.push(savedPost.id);

                                            var newhashtag = new Hashtags({
                                                tag: hashtag,
                                                users: firstUserToSave,
                                                auctions: firstAuctionToSave,
                                                count: 1,
                                            });

                                            newhashtag.save((err, saved)=>{
                                                if(err)  res.send({postCreated: false, errorOccurred: true});
                                                else {
                                                    Hashtags.findOneAndUpdate({_id: saved.id}, {$push: {posts: savedPost.id, users: req.session.user.username}, count: 1}, {new: true}, (err, updatedHashtag)=>{
                                                        if(updatedHashtag){
                                                            console.log(`Hashtag with tag ${updatedHashtag.tag} has been updated by ${req.session.user.username}`);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                });
                            } else {
                                console.log('Auction was created but wasnt saved to user');
                                res.redirect('/home');
                            }

                            res.redirect('/home');
                        });
                    } else {
                        console.log('Post wasnt created');
                        res.send({postCreated: false, errorOccurred: true});
                    }
                });
            });
        }
    });

    server.post('/api/signin', (req, res)=>{
        if(req.session.user){
            res.send({sessionCreated: true});
        } else {
            User.findOne({$or:[
                {email: req.body.userlogin.toLowerCase()},
                {username: req.body.userlogin.toLowerCase()}
            ]}, (err, foundData)=>{
                if(!foundData){
                    res.send({userFound: false, passwordMatch: false, sessionCreated: false});
                }
                if(foundData){
                  bcrypt.compare(req.body.password, foundData.password, (err, result)=>{
                    if(!result){
                        res.send({userFound: true, passwordMatch: false, sessionCreated: false});
                    }
                    if(result){
                        req.session.user = foundData;
                        res.send({userFound: true, passwordMatch: true, sessionCreated: true});
                        console.log(`${req.session.user.username} just signed in.......${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}:${new Date().getUTCMilliseconds()} - /${new Date().getMonth()}/${new Date().getDate()}/${new Date().getFullYear()}`);

                    }
                  });
                }
            });
        }
    });

    server.post('/api/createaccount', (req, res)=>{
      if(req.session.user){
        res.send({userCreated: true});
      } else{
        User.findOne({email: req.body.email.toLowerCase()}, (err, foundEmail)=>{
            if(foundEmail){
                console.log('Just Checked email, it exists', req.body.email.toLowerCase());
                res.send({emailTaken: true, usernameTaken: false, userCreated: false});
            }
            if(!foundEmail){
                console.log('Just Checked email, it doesnt exist', req.body.email.toLowerCase());
                User.findOne({username: req.body.username.toLowerCase()}, (err, foundUser)=>{
                    if(foundUser){
                        console.log('Just Checked user, it exists', req.body.username.toLowerCase());
                        res.send({usernameTaken: true, emailTaken: false, userCreated: false});
                    }
                    if(!foundUser){
                        console.log('Just Checked user, it doesnt exist', req.body.username.toLowerCase());

                        bcrypt.hash(req.body.password, saltRounds, (err, hashPassword)=>{
                            var user  = new User({
                                fullname: req.body.fullname.toLowerCase(),
                                username: req.body.username.toLowerCase(),
                                country: req.body.country.toLowerCase(),
                                email: req.body.email.toLowerCase(),
                                password: hashPassword
                            });

                            user.save((err, savedUser)=>{
                                if(savedUser){
                                    req.session.user = user
                                    console.log(`A new User with username ${req.body.username} has been created.`);
                                    res.send({userCreated: true});
                                    console.log(user);
                                } else {
                                    console.log('There was an error creating a new user.');
                                    res.send({userCreated: false});
                                }
                            });
                        });
                    }
                });
            }
        });
      }
    });

    server.post('/api/signup/checkemail', (req, res)=>{
        User.findOne({email: req.body.email.toLowerCase()}, (err, found)=>{
            if(found){
                res.send({emailTaken: true});
            }
            if(!found){
                res.send({emailTaken: false});
            }
        });
    });

    server.post('/api/signup/checkusername', (req, res)=>{
        User.findOne({username: req.body.username.toLowerCase()}, (err, found)=>{
            if(found){
                console.log('Username has been taken.');
                res.send({usernameTaken: true});
            }
            if(!found){
                console.log('cool username');
                res.send({usernameTaken: false});
            }
        });

    });

    server.post('/verifyemail', (req, res)=>{
        verificationEmail = req.body.email;
        Verification.findOne({email: verificationEmail}, (err, foundEmail)=>{
            if(!foundEmail){
                res.send({noEmail: true})
            }
            if(foundEmail){
                if(foundEmail.code == req.body.verificationcode){
                    User.findOneAndUpdate({email: verificationEmail}, {verified: true}, {upsert: true, useFindAndModify: false}, (err, userData)=>{
                        if(userData.verified){
                            Verification.deleteOne({email: verificationEmail}, (err, deletedUser)=>{
                                if(err){
                                    console.log('There was an error deleting');
                                }
                            });
                            req.session.user = userData;
                            res.send({userVerified: true, codeMatch: true})
                        }
                    });
                } else{
                    res.send({codeMatch: false})
                }
            }
        });
    });

    server.post('/followuser', (req, res)=>{
        if(req.session.user){
            console.log('follow user');

            User.findOneAndUpdate({username: req.body.username}, {$push: {followers: req.session.user.username}}, {upsert: true, useFindAndModify: false}, (err, updatedFollower)=>{
                if(updatedFollower){
                    User.findOneAndUpdate({username: req.session.user.username}, {$push: {following: updatedFollower.username}}, {upsert: true, useFindAndModify: false}, (err, updatedUser)=>{
                        if(updatedUser){
                            User.findOne({username: req.session.user.username}, (err, user)=>{
                                if(user){
                                    console.log('hello');
                                    req.session.user = user;
                                    console.log(req.session.user.following);
                                    res.send({followedUser: true, noOfMyFollowing: user.following.length, sessionUser: user.username});
                                }
                                if(!user){
                                    console.log('no hello');
                                }
                                if(err){
                                    console.log('error');
                                }
                            });
                        }
                        if(!updatedUser){
                            console.log('not hello');
                        }
                        if(err){
                            console.log('error hello');
                        }
                    });
                } else {
                    res.send({followedUser: false});
                }
            });

        } else {
            res.send({followedUser: false});
        }
    });

    server.post('/newbid', (req, res)=>{
        if(req.session.user){
            Post.findOneAndUpdate({_id: req.body.postId}, {$push: {bids: {bidder: req.session.user.username, price: req.body.price, date: new Date()}}}, {upsert: true, useFindAndModify: false}, (err, bidSubmitted)=>{
                if(bidSubmitted){
                    console.log('done');
                    res.send({bidSubmitted: true});
                }
                if(err){
                    console.log('There was an error');
                }
            });
        } else {

        }
    });

    server.post('/recoverpassword', (req, res)=>{
        User.findOne({email: req.body.email}, (err, foundUser)=>{
            if(foundUser){
                var resetLink = '';
                var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                for(var i = 0; i < 10; i++){
                    resetLink += characters.charAt(Math.floor(Math.random() * characters.length))
                }

                var passwordReset = new PasswordReset({
                    email: req.body.email.toLowerCase(),
                    resetLink: `${req.body.email}/${resetLink}`,
                    date: new Date()
                });

                PasswordReset.deleteOne({email: passwordReset.email}, (err, deleted)=>{
                    if(deleted){
                        passwordReset.save((err, savedRequest)=>{
                            if(savedRequest){
                                var mailTransporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'auctionproject2020@gmail.com',
                                        pass: 'frenzyiscalm'
                                    }
                                });

                                var pagelink = `bidall.herokuapp.com/reset/${passwordReset.resetLink}`

                                var mailDetails = {
                                    from: 'auctionproject2020@gmail.com',
                                    to: passwordReset.email,
                                    subject: `Reset Your Password`,
                                    html: `<html>
                                    <style>
                                        p{
                                            padding: 1% 0%;
                                            font-size: 126%;
                                        }
                                    </style>
                                    <body>
                                        <section style='padding: 0% 2%; color: grey;'>
                                            <div style="border-bottom: 1px solid rgb(228, 228, 228); font-size: 200%; padding: 3% 0%; font-weight: 700; color: black;">BIdall</div>
                                            <div style="font-size: 140%;">
                                                <p>Hi, ${foundUser.username} </p>
                                                <p>We got a request to reset your password.</p>

                                                <a href="${pagelink}"><button style="outline: none; border: none; border-radius: 5px; background: rgb(255, 193, 36); padding: 2% 0%; font-size: 90%; width: 100%; font-weight: 700; color: white">Reset Password</button></a>

                                                <p> If you didn't request a password reset, ignore this message and your password will not be changed.</p>

                                                <div style="margin: 10% 0% 0% 0%; font-size: 80%">
                                                    <span>from</span><br>
                                                    <span style="color: black; font-weight: 500;">BIdall</span>
                                                </div>
                                            </div>
                                        </section>
                                    </body>
                                </html>`
                               }

                                mailTransporter.sendMail(mailDetails, function(err, data){
                                    if(err){
                                        console.log('Error Occurs', err);
                                    }
                                    if(data) {
                                        console.log( '(' + foundUser.username + ') requested a password reset on' + ' - ' + new Date().getUTCHours() + ':' + new Date().getUTCMinutes() + ':' + new Date().getUTCSeconds() + ':' + new Date().getUTCMilliseconds() + ' ' + new Date().getUTCDate() + '/' + (new Date().getUTCMonth() + 1)  + '/' + new Date().getUTCFullYear());
                                    }
                                })

                            }
                            if(!savedRequest){
                                console.log('COULDNT SAVE REQUEST, TRY AGAIN');
                            }
                            if(err){
                                console.log('ERROR SAVING REQUEST');
                            }
                        });
                    }
               });
            }
            if(!foundUser){
                console.log('Doesnt exists');
            }
        });
    });

    server.post('/likepost', (req, res)=>{
        if(req.session.user){
            Post.findById({_id: req.body.postId}, (err, foundPost)=>{
                if(!foundPost.likes.includes(req.session.user.username)){
                    Post.findByIdAndUpdate({_id: req.body.postId}, {$push: {"likes": req.session.user.username}}, {upsert: true, useFindAndModify: false}, (err, likedPost)=>{
                        if(likedPost){
                            Post.findById({_id: req.body.postId}, (err, found)=>{
                                if(found) res.send({likedPost: true, likesno: found.likes.length, errorOccurred: false});
                            });
                        } else {
                            res.send({likedPost: false, errorOccurred: true});
                        }
                    });
                } else {
                    Post.findByIdAndUpdate({_id: req.body.postId}, {$pull: {"likes": req.session.user.username}}, {upsert: true, useFindAndModify: false}, (err, unlikedPost)=>{
                        if(unlikedPost){
                            Post.findById({_id: req.body.postId}, (err, found)=>{
                                if(found) res.send({unlikedPost: true, likesno: found.likes.length, errorOccurred: false});
                            });
                        } else {
                            res.send({unlikedPost: false, errorOccurred: true});
                        }
                    });
                }
            });
        } else {

        }
    });

    server.post('/selectbidaswinner', (req, res)=>{
        if(req.session.user){
            //fetch the post information
            Post.findById({_id: req.body.postId}, (err, foundPost)=>{
                //check if a winner has been previously selected
                if(foundPost){
                    if(foundPost.live == true){
                        console.log('post is live');
                        //if post is live it means a winner hasnt been selected
                        //select bid as winner
                        Post.findOneAndUpdate({_id: req.body.postId, "bids._id": req.body.bidId},
                        {"live": false, $set: {"bids.$.winner": true}},{upsert: true, useFindAndModify: false} , (err, winnerselected)=>{
                            if(winnerselected){
                                console.log('Winning bid has been selected');
                                //check if a chatroom already exists for this buyer and seller
                                Chat.findOne({$and: [{user: foundPost.user}, {bidWinner: req.body.biddername}]}, (err, foundChatRoom)=>{
                                    if(foundChatRoom){
                                        Post.findOneAndUpdate({_id: req.body.postId}, {chatroom: foundChatRoom._id},{upsert: true, useFindAndModify: false} , (err, updatedPost)=>{
                                            if(updatedPost){
                                                console.log('Chat found', foundChatRoom._id);
                                                res.send({setAsWinner: true, post: foundPost, chatId: foundChatRoom._id});
                                            } else {

                                            }
                                        });
                                    }
                                    if(!foundChatRoom){
                                        var newChatRoom = new Chat({
                                            postId: foundPost._id,
                                            user: foundPost.user,
                                            bidWinner: req.body.biddername,
                                            price: req.body.price,
                                            date: new Date()
                                        });

                                        newChatRoom.save((err, savedChatRoom)=>{
                                            if(savedChatRoom){
                                                Post.findOneAndUpdate({_id: req.body.postId}, {chatroom: savedChatRoom._id},{upsert: true, useFindAndModify: false} , (err, updatedPost)=>{
                                                    if(updatedPost){
                                                        console.log('Chat wasnt found so created', savedChatRoom._id);
                                                        res.send({setAsWinner: true, post: foundPost, chatId: savedChatRoom._id});
                                                    } else {

                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            } else {

                            }
                        });
                    } else {
                        console.log('post is live');
                        Post.findOneAndUpdate({_id: req.body.postId, "bids.winner": true}, {$set: {"bids.$.winner": false}},{upsert: true, useFindAndModify: false} , (err, winnerdeselected)=>{
                            if(winnerdeselected){
                                console.log('Winning bid has been temp deselected');
                                Post.findOneAndUpdate({_id: req.body.postId, "bids._id": req.body.bidId}, {"live": false, $set: {"bids.$.winner": true}},{upsert: true, useFindAndModify: false} , (err, winnerselected)=>{
                                    if(winnerselected){
                                        console.log('Winning bid has been selected');
                                        Chat.findOne({$and: [{user: foundPost.user}, {bidWinner: req.body.biddername}]}, (err, foundChatRoom)=>{
                                            if(foundChatRoom){
                                                Post.findOneAndUpdate({_id: req.body.postId}, {chatroom: foundChatRoom._id},{upsert: true, useFindAndModify: false} , (err, updatedPost)=>{
                                                    if(updatedPost){
                                                        console.log('Chat found', foundChatRoom._id);
                                                        res.send({setAsWinner: true, post: foundPost, chatId: foundChatRoom._id});
                                                    } else {

                                                    }
                                                });
                                            }
                                            if(!foundChatRoom){
                                                var newChatRoom = new Chat({
                                                    postId: foundPost._id,
                                                    user: foundPost.user,
                                                    bidWinner: req.body.biddername,
                                                    price: req.body.price,
                                                    date: new Date()
                                                });

                                                newChatRoom.save((err, savedChatRoom)=>{
                                                    if(savedChatRoom){
                                                        Post.findOneAndUpdate({_id: req.body.postId}, {chatroom: savedChatRoom._id},{upsert: true, useFindAndModify: false} , (err, updatedPost)=>{
                                                            if(updatedPost){
                                                                console.log('Chat wasnt found so created', savedChatRoom._id);
                                                                res.send({setAsWinner: true, post: foundPost, chatId: savedChatRoom._id});
                                                            } else {

                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    } else {

                                    }
                                });
                            } else {

                            }
                        });
                    }
                } else {
                    //post not found
                }
            });
        } else {

        }
    });

    server.post('/deselectwinner', (req, res)=>{
        if(req.session.user){
            Post.findOneAndUpdate({_id: req.body.postId, "bids._id": req.body.bidId}, {"live": true, $set: {"bids.$.winner": false}},{upsert: true, useFindAndModify: false} , (err, winnerselected)=>{
                if(winnerselected){
                    console.log('Winning bid has been deselected');
                    Post.findById({_id: req.body.postId}, (err, foundPost)=>{
                        res.send({deselectedWinner: true, post: foundPost});
                    });
                } else {

                }
            });
        } else {

        }
    });

    server.post('/sendmessages', (req, res)=>{
        if(req.session.user){
            Chat.findOneAndUpdate({_id: req.body.chatroomid}, {$push : {messages: {sender: req.body.sender, recipient: req.body.recipient, content: req.body.content, date: new Date()}}}, {upsert: true, useFindAndModify: false}, (err, chatRoomUpdated)=>{
                if(chatRoomUpdated){
                    console.log('chat updated');
                    res.send({messageSent: true, errorOccurred: false});
                } else {
                    console.log('chat not updated');
                    res.send({messageSent: false, errorOccurred: true});
                }
            });
        } else {

        }
    });

    // server.post('/');
}
