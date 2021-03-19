const Review = require('../models/reviewModel');
const CatchAsync = require('../Utils/CatchAsync');
const db = require("./../models");

const review = db.reviews;

exports.addNewReview = CatchAsync(async(req, res, next)=>{
    const body = req.body;

    const newReview = {sender: body.sender, comment: body.comment, product: body.product}

    const saveReview = await review.create(newReview);
    
    if(saveReview){
        return res.send({
            status: true,
        });
    }else{
        return res.send({
            status: false,
        })
    }
});

exports.getReview = CatchAsync(async(req, res, next)=>{
    const getReview = await review.findAll();
    if(getReview){
        return res.send(getReview);
    }else{
        return res.send({
            status: false,
        })
    }
});