const path= require ('path');
const fs = require('fs-extra');

const reviewsFilePath = path.join(__dirname,"reviews.json");
const filmsFilePath = path.join(__dirname,"films.json")

module.exports = {
    getFilms: async ()=>{
        const buffer = await fs.readFile(filmsFilePath);
        const content = buffer.toString();
        return JSON.parse(content)
    },
    getReviews: async ()=>{
        const buffer = await fs.readFile(reviewsFilePath);
        const content = buffer.toString();
        return JSON.parse(content)
    },
    writeFilms: async(data)=>{
        await fs.writeFile(filmsFilePath,JSON.stringify(data))
    },
    writeReviews: async ( data)=>{
        await fs.writeFile(reviewsFilePath, JSON.stringify(data))
    }
}