const { isArray, isEmpty } = require('lodash');
const Post = require('../models/events');
const User = require('../models/user');

exports.search = async (req,res,next) => {
    try{
        const exp = req.body.exp;
        const posts = await Post.find({$or:
            [{title:{$regex: `${exp}`, $options: 'i'}},
            {content:{$regex: `${exp}`, $options: 'i'}},
            {category:{$regex: `${exp}`, $options: 'i'}},
            {city:{$regex: `${exp}`, $options: 'i'}},
            {venueORlink:{$regex: `${exp}`, $options: 'i'}}]
            }).populate('creator');
        let allPosts = [];
        for(let i=0;i<posts.length;++i){
            if(posts[i].creator.isCreator)
                allPosts.push(posts[i]);
        }
        return res.status(200).send(allPosts);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.filter = async (req,res,next) => {
    try{
        let post;
        let postArray = [];
        let category = req.query.category;
        if(!isArray(category))
            category = Array(category);
        const dateA = req.query.dateA;
        const dateB = req.query.dateB;
        const timeA = req.query.timeA;
        const timeB = req.query.timeB;
        const isOnline = req.query.isOnline;
        const city = req.query.city;
        const rateA = req.query.rateA;
        const rateB = req.query.rateB;
        let ratings = parseInt(req.query.ratings);
        if(category[0]!==undefined){
            post = await Post.find({category:{$in:category}});
            if(post!==null)
                for(let j=0;j<post.length;++j)
                    postArray.push(post[j]);
        }//category undefined condition left
        post = await Post.find({$and:[{date:{$gte: Date(dateA),$lt: Date(dateB)}},
            {isOnline:isOnline},{city:city},{rate:{$gte:rateA,$lt:rateB}},
            {ratings:{$gte:ratings}},{time:{$gte:timeA,$lt:timeB}}
            ]});//multiple fields left
            //array condition left
        for(let j=0;j<post.length;++j)
            postArray.push(post[j]);
        let filteredPosts = [...new Set(postArray)];
        return res.status(200).send(filteredPosts);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.getUserDetails = async (req,res,next) => {
    try{
        const userId = req.userId;
        const user = await User.findById(userId);
        if(!isEmpty(user.event))
            user.populate('event');
        if(!isEmpty(user.bookmarked))
            user.populate('bookmarked');
        if(!isEmpty(user.registeredEvents))
            user.populate('registeredEvents');
        return res.status(200).send(user);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};