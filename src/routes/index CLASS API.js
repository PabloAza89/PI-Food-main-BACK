// INDEX CLASSIC WITH API
const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require('axios');
require('dotenv').config();
const { API_KEY1 , API_KEY2 , API_KEY3 , API_KEY4 , API_KEY5 } = process.env;
const API_KEY = API_KEY1;
const NUMBER = 3;

const { Recipes , Diets , Op } = require('../db.js'); 

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

let allApiResults = async () => {
    const apiRawData = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=${NUMBER}&addRecipeInformation=true`);
    return apiRawData.data.results.map(e => {
        return {
            id: e.id,
            title: e.title,
            summary: e.summary,
            healthScore: e.healthScore,
            analyzedInstructions:
                e.analyzedInstructions[0] ? e.analyzedInstructions[0].steps.map(e=> e.step) : [],
            image: e.image,
            diets: e.diets.map(function(e) {
                if ((e.indexOf(e) !== e.length - 1)) {
                    return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
                } else return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
                }),
            dishTypes: e.dishTypes
        }
    })
}

router.get('/recipes', async (req, res) => {
    const { title } = req.query;
    
    function ifTitleExists () {
        return req.query.title ? { title: {[Op.like]: `%${req.query.title.toLowerCase()}%`}} : {}        
    }

    try {
        const searchDBRecipes = await Recipes.findAll({
            where: 
            ifTitleExists()
            ,
            include: [{
                model: Diets,
                attributes: ['title'],
                through: {
                    attributes: []
                }
            }]
        })

        let dietsArray = searchDBRecipes.map(e => e.Diets).map(e => e.map(e => e.title))
        
        let arrayForDB = []

        dietsArray.map(e => {
            arrayForDB.push({
                id: searchDBRecipes[dietsArray.indexOf(e)].id,
                title: searchDBRecipes[dietsArray.indexOf(e)].title,
                summary: searchDBRecipes[dietsArray.indexOf(e)].summary,
                healthScore: searchDBRecipes[dietsArray.indexOf(e)].healthScore,
                analyzedInstructions: searchDBRecipes[dietsArray.indexOf(e)].analyzedInstructions,            
                diets: e
            })
        })

        let allApiResultsHelper = await allApiResults()
        const apiFilteredResult = req.query.title?allApiResultsHelper.filter(e => e.title.toLowerCase().includes(req.query.title.toLowerCase())):allApiResultsHelper;
        return res.status(200).send(arrayForDB.concat(apiFilteredResult))
    }
    catch (e) {
        if (e.code === 'ERR_BAD_REQUEST') res.status(402).send('ERROR DE API_KEY.. POR FAVOR ACTUALIZA LA API KEY !')
        else res.send(e.code)
    }
});

router.get('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    var findByIDinDB;
 
    try {
        if (true) {
            let allApiResultsHelper = await allApiResults()
            const apiFilteredResult = allApiResultsHelper.filter(e => e.id === parseInt(id));

            if (apiFilteredResult[0] === undefined) {
                findByIDinDB = await Recipes.findByPk(id, {
                    include: [{
                        model: Diets,
                        attributes: ['title'],
                        through: {
                          attributes: []
                        }
                      }]
                })
                let dietsArray = findByIDinDB.Diets.map(e => e.title)
                let modifiedDBObj = {
                    id: findByIDinDB.id,
                    title: findByIDinDB.title,
                    summary: findByIDinDB.summary,
                    healthScore: findByIDinDB.healthScore,
                    analyzedInstructions: findByIDinDB.analyzedInstructions,                   
                    diets: dietsArray
                }
                return res.status(200).send(modifiedDBObj)

            } else {
                res.status(200).send(apiFilteredResult)
            }
        }
    }
    catch (e) {
        res.status(400).send('No hay recetas con ese id')      
    }
});

router.post('/recipes', async (req, res) => {
    const { diets , title , summary , healthScore , analyzedInstructions } = req.body;    
    
    try {
        const createRecipe = await Recipes.create({
            title: title,
            summary: summary,
            healthScore: parseInt(healthScore),
            analyzedInstructions: analyzedInstructions
          });
        const relatedDiets = await Diets.findAll({           
            where: { [Op.or]: [ { title: diets } ] }
        })
        createRecipe.addDiets(relatedDiets)
        res.status(200).send(createRecipe)
    } catch(e) {
        res.status(400).send("THERE WAS AND ERROR WHILE CHARGING DATA..")
    }
});

router.get('/diets', async (req, res) => {
    try {
        const diets = await Diets.findAll()
        res.status(200).send(diets)
    }
    catch (e) {
        res.status(400).send('No hay dietas disponibles...')      
    }
});

module.exports = router;
