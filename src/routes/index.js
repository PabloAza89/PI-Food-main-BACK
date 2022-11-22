// INDEX SUMMARIZED WITH JSON
const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require('axios');
require('dotenv').config();
const { API_KEY1 , API_KEY2 , API_KEY3 , API_KEY4 , API_KEY5 } = process.env;
const API_KEY = API_KEY1;
const NUMBER = 3;

const { Recipes , Diets , Op } = require('../db.js'); 
let toAvoidKey = require('../../toAvoidKey');

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

let allApiResults = async () => {
    return await toAvoidKey.results.map(e => {
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

router.get('/recipes(|/:id)', async (req, res) => {
    try {
        let foundInDB  = await Recipes.findAll({
            where: req.query.title? { title: {[Op.like]: `%${req.query.title.toLowerCase()}%`}} : req.params.id ? { id: req.params.id } : {},
            include: [{
                model: Diets,
                attributes: ['title'],
                through: { attributes: [] }
            }]  
        }).catch(function(e){ console.log('NOT FOUND IN DB.. SCRIPT CONTINUED HANDLER : "foundInDB != null"') }); 

        let allApiResultsHelper = await allApiResults()
            
        if (foundInDB != null) {
            let dietsArray = foundInDB.map(e => e.Diets).map(e => e.map(e => e.title));
            let arrayDB = []

            dietsArray.map(e => {
                arrayDB.push({
                    id: foundInDB[dietsArray.indexOf(e)].id,
                    title: foundInDB[dietsArray.indexOf(e)].title,
                    summary: foundInDB[dietsArray.indexOf(e)].summary,
                    healthScore: foundInDB[dietsArray.indexOf(e)].healthScore,
                    analyzedInstructions: foundInDB[dietsArray.indexOf(e)].analyzedInstructions,
                    diets: e
                })
            })
                    
            const apiFilteredResult = req.query.title?allApiResultsHelper.filter(e => e.title.toLowerCase().includes(req.query.title.toLowerCase())): req.params.id ? allApiResultsHelper.filter(e => e.id === parseInt(req.params.id)) : allApiResultsHelper;
            if (apiFilteredResult[0] === undefined && arrayDB[0] === undefined) return res.status(400).send('THERE ARE NOT RECIPES BY THAT NAME.. :(')
            return res.status(200).send(arrayDB.concat(apiFilteredResult))
        } else {
            if (parseInt(req.params.id).toString() === req.params.id.toString()) {
                if (allApiResultsHelper.filter(e => e.id === parseInt(req.params.id))[0] === undefined) return res.status(400).send('THERE ARE NOT RECIPES BY THAT ID.. :(')
                else return res.status(200).send(allApiResultsHelper.filter(e => e.id === parseInt(req.params.id))) 
                
            } else return res.status(400).send('THERE ARE NOT RECIPES BY THAT ID.. :(')
        } 
    } catch(e) {
        if (e.code === 'ERR_BAD_REQUEST') res.status(402).send('API_KEY ERROR... PLEASE, UPDATE THE API_KEY !')
        else res.status(400).send('THERE ARE NOT RECIPES BY THAT TITLE OR ID..')
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
        res.status(400).send("THERE WAS AND ERROR WHILE CHARGING DATA...")
    }
});

router.post('/diets', async (req, res) => {
    try {
        res.json(await Diets.bulkCreate([      
            { title: "All Diets", },
            { title: "Gluten Free", },
            { title: "Ketogenic" },
            { title: "Vegan" },
            { title: "Lacto Ovo Vegetarian" },
            { title: "Pescatarian" },
            { title: "Paleolithic" },
            { title: "Primal" },
            { title: "Fodmap Friendly" },
            { title: "Whole 30" },
            { title: "Dairy Free" }
          ], {validate: true}))
    }
    catch(e) {
        res.status(400).send('ONLY A-Z OR 0-9 VALUES ALLOWED ! OR "DIETS" ALREADY EXISTS...')
    } 
});

router.get('/diets', async (req, res) => {
    try {
        const diets = await Diets.findAll()
        res.status(200).send(diets)
    }
    catch (e) {
        res.status(400).send('THERE ARE NOT AVAILABLE RECIPES...')
    }
});

module.exports = router;
