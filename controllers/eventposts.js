const { validationResult } = require('express-validator');
const path=require('path');
const fs=require('fs');
const mongoose = require('mongoose');

const Post = require('../models/events');
const User = require('../models/user');

const clearImg = imgArray => {
    try{
        for(let i=0; i<imgArray.length; ++i){
            var filepath = path.join(__dirname, '../images', imgArray[i]);
            fs.unlink(filepath, err => console.log(err));
        }
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.createPosts = async (req,res,next) => {
    if(!validationResult(req).isEmpty())
        return res.status(422).json(validationResult(req).errors[0].msg);
    try
    {
        const title=req.body.title;
        const content=req.body.content;
        const category=req.body.category;
        const venueORlink=req.body.venueORlink;
        const isOnline=req.body.isOnline;
        const city=req.body.city;
        const time=req.body.time;
        const date=req.body.date;
        const rate=req.body.rate;
        const imageUrl=req.imagesArray;
        const userId=req.userId;

        const newPost=new Post({
            title:title,
            content:content,
            category:category,
            creator:userId,
            venueORlink:venueORlink,
            isOnline:isOnline,
            time:time,
            imageUrl:imageUrl,
            date:date,
            rate:rate,
            city:city
        });

        await newPost.save();
        let user = await User.findByIdAndUpdate(userId,{$push:{event:newPost}},{new:true});
        if(!user.isCreator)
            user = await User.findByIdAndUpdate(userId,{$set:{apply:true}},{new:true});
        await user.save();
        return res.status(200).json(newPost._id);
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

exports.deletePost = async (req,res,next) => {
    const userId = req.userId;
    const postId = req.params.postId;
    try
    {
        const post = await Post.findById(postId);
        if(post===null)
            return res.status(423).send('this post does not exists');

        if(post.creator.toString()!==userId.toString())
            return res.status(422).send('you are not allowed to make changes in this post');
        
        clearImg(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        await User.updateMany({bookmarked:postId},{$pull:{bookmarked:postId}});
        await User.updateMany({registeredEvents:postId},{$pull:{registeredEvents:postId}});
        await User.updateMany({ratedEvents:{$regex:`^${postId}`, $options:'i'}},
            {$pull:{ratedEvents:{$regex:`^${postId}`, $options:'i'}}});
        await User.findByIdAndUpdate(userId,{$pull:{event:postId}});
        return res.status(200).send('deleted event');
        
    }catch(err){
        if(!err.statusCode)
          err.statusCode=500;
        next(err);
    }
};

exports.updatePost = async (req,res,next) => {
    if(!validationResult(req).isEmpty())
        return res.status(422).json(validationResult(req).errors[0].msg);
    try
    {
        const userId = req.userId;
        const postId = req.params.postId;
        const content=req.body.content;
        const time=req.body.time;
        const category=req.body.category;
        const date=req.body.date;
        const rate=req.body.rate;
        const post = await Post.findById(postId);
        if(post===null)
            return res.status(423).send('this post does not exists');

        if(post.creator.toString()!==userId.toString())
            return res.status(422).send('you are not allowed to make changes in this post');
            
        const updatedPost = await Post.findByIdAndUpdate(postId,{$set:
            {content:content,time:time,category:category,date:date,rate:rate}},{new:true});
        return res.status(200).send(updatedPost);
    }catch(err){
        if(!err.statusCode)
          err.statusCode=500;
        next(err);
    }
};

exports.AddImages = async (req,res,next) => {
    const userId = req.userId;
    const postId = req.params.postId;
    const imgArray = req.imagesArray;
    try
    {
        const post = await Post.findById(postId);
        if(post===null)
            return res.status(423).send('this post does not exists');

        if(post.creator.toString()!==userId.toString())
            return res.status(422).send('you are not allowed to make changes in this post');

        for(let i=0;i<imgArray.length;++i)
            await post.imageUrl.push(imgArray[i]);  
        await post.save();  
        return res.status(200).send('added images');
    }catch(err){
        if(!err.statusCode)
          err.statusCode=500;
        next(err);
    }
};

exports.delImages = async (req,res,next) => {
    const userId = req.userId;
    const postId = req.params.postId;
    try
    {
        const post = await Post.findById(postId);
        if(post===null)
            return res.status(423).send('this post does not exists');

        if(post.creator.toString()!==userId.toString())
            return res.status(422).send('you are not allowed to make changes in this post');

        let imgPath=String(req.body.imgPath);
        imgPath=imgPath.split('/')[3];

        var filepath = path.join(__dirname,'../images',imgPath);
        fs.unlink(filepath,async (err)=>{
            if(err)
                return res.status(401).send('file does not exists');
            await Post.findByIdAndUpdate(postId,{$pull:{imageUrl:imgPath}});
            return res.status(200).send('deleted the image');
        });
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};