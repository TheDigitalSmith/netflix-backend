const express = require("express")
const router = express.Router();
const {getFilms, writeFilms,} = require("../data/dataHelper")
const fs = require("fs-extra");
const path = require("path")
const multer = require("multer");

const uuidv4 = require("uuid/v4")

//RETRIEVING FILMS
router.get("/",async (req,res)=>{
    const films = await getFilms();
    res.send(films);
})

//POSTING FILMS
router.post("/", async(req,res)=>{
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