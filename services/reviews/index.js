const express = require ("express");
const router = express.Router();
const uuidv4 = require("uuid/v4");
const { check,validationResult, sanitize} = require("express-validator");
const {getReviews, writeReviews, getFilms} = require('../data/dataHelper');

router.get("/",async (req,res)=>{
    const reviews = await getReviews();
    res.send(reviews);
})

router.post("/", 
[check("comment").isLength({min: 20}).withMessage("comments needs to be at least 20 chars"),
check("rate").exists().withMessage("please include a rate"),
check("imdbID").exists().withMessage("please include the imdbID")
],
async(req,res)=>{
    const films = await getFilms();
    const reviews = await getReviews();
    let reviewForFilm = films.find(film => film._id === req.body.elementId);
    if (reviewForFilm){
        let newReview ={
            ...req.body,
            _id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date()
        }
        reviews.push(newReview)
        await writeReviews(reviews);
        res.send(newReview);
    }
})

router.delete("/:id", async(req,res)=>{
    const reviews = await getReviews();
    const reviewsToRemain = reviews.filter(review=> review._id !== req.params.id);
    if(reviewsToRemain.length < reviews.length){
        await writeReviews(reviewsToRemain);
        res.send("Removed");
    }else{
        res.status("404").send("Review not found");
    }
})

router.put("/:id",async ( req,res)=>{
    const reviews = await getReviews();
    const films = await getFilms ();
    const ReviewsOfFilmToEdit = films.find(film=> film._id === req.body.elementId)
    if ( req.body.elementId && ReviewsOfFilmToEdit){
        const reviewToEdit = reviews.find(review = review._id === req.params.id);
        if (reviewToEdit){
        delete req.body._id;
        delete req.createdAt;
        req.body.updatedAt = new Date ();
        let editedReview = Object.assign(ReviewsOfFilmToEdit, req.body)
        let position = reviews.indexOf(ReviewsOfFilmToEdit);
        reviews[position] = editedReview;
        await writeReviews(reviews);
        res.send(editedReview);
        }else{
            res.status("404").send("Review Not Found")
        }
    }else{
        res.status("404").send("No matching Review for Film i.e ElementId incorrect")
    }
})
module.exports = router;