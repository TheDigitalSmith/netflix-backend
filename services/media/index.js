const express = require("express")
const router = express.Router();
const {getFilms, writeFilms, getReviews} = require("../data/dataHelper");
const fs = require("fs-extra");
const path = require("path")
const async = require("express-async-await");
const fetch = require("node-fetch");
const multer = require("multer");
const {check, validationResult, sanitizebody} = require ('express-validator');
const uuidv4 = require("uuid/v4")

//RETRIEVING FILMS
router.get("/",async (req,res)=>{
    const films = await getFilms();
    res.send(films);
})

// //RETRIEVING FILMS BY ID FROM OMDB
// router.get("/:id",async(req,res)=>{
//     function getOmdb (){
//         const imdbId = req.params.id
//         return fetch (`http://www.omdbapi.com/?apikey=7ef98004&${imdbId}`);
//     }
//     const processData = async () => {
//         const film = await getOmdb()
//         const ResponseData = await film.json()
//         console.log(ResponseData)
//     }
// })


//RETRIEVING THE REVIEWS FOR FILMS
router.get("/:id/reviews",async (req,res)=>{
    const reviews = await getReviews();
    const reviewsForFilm = reviews.filter(review=> review.elementId === req.params.id);
    if (reviewsForFilm){
        res.send(reviewsForFilm)
    }else{
        res.status("404").send("no reviews available")
    }
})

//POSTING FILMS
router.post("/",
[check("Title").isLength({min:2}).withMessage("Title needs to be at least 2 chars"),
check("Year").exists().withMessage("Year must be included"),
check("imdbID").exists().withMessage("please include the imdbID"),
check("type").exists().withMessage("please include type"),
check("Poster").exists().withMessage("please include an image")
],
async(req,res)=>{
    const films = await getFilms();
    const newFilm = {
        ...req.body,
        _id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    films.push(newFilm);
    await writeFilms(films);
    res.send(newFilm)
})

//UPLOADING MEDIA
const multerConfig = multer({});

router.post("/:id/upload",multerConfig.single("filmPic"),async (req,res)=>{
    const films = await getFilms();
    const film = films.find(film => film._id === req.params.id)
    if(film){
        const filedest = path.join(__dirname,"../../images", req.params.id + path.extname(req.file.originalname))
        await fs.writeFile(filedest, req.file.buffer)
        film.updatedAt = new Date();
        film.poster = "/images/" + req.params.id + path.extname(req.file.originalname);
        await writeFilms(film);
        res.send(film)
    }else{
        res.status("404").send("film not found")
    }
})

//DELETING FILM
router.delete("/:id",async(req,res)=>{
    const films = await getFilms();
    const filmsToRemain = films.filter(film=> film._id === req.params.id)
    if(filmsToRemain.length < films.length){
        await writeFilms(filmsToRemain);
        res.send("Removed");
    }else{
        res.status("404").send("Film not found")
    }
})

//EDITING FILM
router.put("/:id", async(req,res)=>{
    const films = await getFilms();
    const filmToEdit = films.find(film => film._id === req.params.id);
    if (filmToEdit) {
        delete req.body._id;
        delete req.body.createdAt;
        req.body.updatedAt = new Date();
        let editedFilm = Object.assign(filmToEdit, req.body)
        let position = films.indexOf(filmToEdit);
        films[position] = editedFilm;
        await writeFilms(films);
        res.send(editedFilm);
    }else{
        res.status("404").send("Film not found");
    }
})
module.exports = router;