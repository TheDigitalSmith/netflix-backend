const express = require("express")
const router = express.Router();
const {getFilms, writeFilms,} = require("../data/dataHelper")

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