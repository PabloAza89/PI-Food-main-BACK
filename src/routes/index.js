// INDEX CLASSIC WITH API
//const v2 = require('cloudinary');
const cloudinary = require('cloudinary').v2
const { Router } = require('express');
const axios = require('axios');
require('dotenv').config();
const { CLD_NAME, CLD_KEY, CLD_SECRET, API_KEY1 , API_KEY2 , API_KEY3 , API_KEY4 , API_KEY5 } = process.env;
const API_KEY = API_KEY1;
const NUMBER = 3;

const { Recipes , Diets , Op } = require('../db.js');

const router = Router();

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
      dishTypes: e.dishTypes,
      userRecipe: false
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
        //console.log("searchDBRecipes.map(e => e.Diets)", searchDBRecipes.map(e => e.Diets))
        //console.log("dietsArray", dietsArray)

        let arrayFromDB = []

        dietsArray.map((e, i) => {
          arrayFromDB.push({
            id: searchDBRecipes[i].id,
            title: searchDBRecipes[i].title,
            image: searchDBRecipes[i].image,
            healthScore: searchDBRecipes[i].healthScore,
            summary: searchDBRecipes[i].summary,
            analyzedInstructions: searchDBRecipes[i].analyzedInstructions,
            userRecipe: searchDBRecipes[i].userRecipe,
            diets: e,
          })
        })

        let allApiResultsHelper = await allApiResults()
        const apiFilteredResult =
          req.query.title ?
          allApiResultsHelper.filter(e => e.title.toLowerCase().includes(req.query.title.toLowerCase())) :
          allApiResultsHelper;
        return res.status(200).send(arrayFromDB.concat(apiFilteredResult))
        //return res.status(200).send(arrayFromDB)
    }
    catch (e) {
        if (e.code === 'ERR_BAD_REQUEST') res.status(402).send('API_KEY ERROR... PLEASE, UPDATE THE API_KEY !')
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
        res.status(400).send('THERE ARE NOT RECIPES BY THAT ID.. :(')
    }
});

router.post('/recipes', async (req, res) => {
  const { title, image, healthScore, summary, diets, analyzedInstructions } = req.body;
  console.log("image", image)
  try {
    if (
      title.replaceAll(" ","").replaceAll("\n", "") === "" ||
      healthScore === "" ||
      summary.replaceAll(" ","").replaceAll("\n", "") === "" ||
      diets.length === 0 ||
      analyzedInstructions.map(e => e.replaceAll(" ","").replaceAll("\n","")).some(e => e === "")
    ) res.status(400).json({'status': 400})
    else {
        const createRecipe = await Recipes.create({
          title: title,
          image: image,
          healthScore: parseInt(healthScore),
          summary: summary,
          analyzedInstructions: analyzedInstructions,
          userRecipe: true
        });
      const relatedDiets = await Diets.findAll({
          where: { [Op.or]: [ { title: diets } ] }
      })

      createRecipe.addDiets(relatedDiets)

      cloudinary.config({
        cloud_name: CLD_NAME,
        api_key: CLD_KEY,
        api_secret: CLD_SECRET
      });

      cloudinary.uploader.upload(image, { public_id: createRecipe.id, overwrite: true },
      function(error, result) {console.log("result", result, "error", error)});

      res.status(200).json({ 'status': 200 })
    }
  } catch(e) {
    res.status(400).json({'status': 400, 'error': e})
  }
});

router.get('/diets', async (req, res) => { // THIS ROUTE ALWAYS RETURN DIETS.
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
    try {
      const diets = await Diets.findAll()
      if (diets.length === 0) res.status(400).send("No diets")
      else res.status(200).send(diets)
    } catch (e) {
      res.status(400).send('THERE ARE NOT AVAILABLE DIETS..')
    }
  }
});

module.exports = router;
