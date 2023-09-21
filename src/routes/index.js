const cloudinary = require('cloudinary').v2
const { Router } = require('express');
const { allApiResults, checkUser } = require('../controller/controller');
const axios = require('axios');
require('dotenv').config();
const { CLD_NAME, CLD_KEY, CLD_SECRET, API_KEY1 , API_KEY2 , API_KEY3 , API_KEY4 , API_KEY5 } = process.env;
const { Recipes , Diets , Dishes, Op } = require('../db.js');

const router = Router();

cloudinary.config({
  cloud_name: CLD_NAME,
  api_key: CLD_KEY,
  api_secret: CLD_SECRET
});

router.get('/recipes', async (req, res) => {
  const { title } = req.query;

  try {
    const searchDBRecipes = await Recipes.findAll({
      where: title ? { title: {[Op.like]: `%${req.query.title.toLowerCase()}%`}} : {},
      include: [
        {
          model: Diets,
          attributes: ['title'],
          through: { attributes: [] }
        },
        {
          model: Dishes,
          attributes: ['title'],
          through: { attributes: [] }
        }
      ]
    })

    let arrayFromDB = searchDBRecipes.map((e) => {
      return {
        id: e.id,
        title: e.title,
        image: e.image,
        healthScore: e.healthScore,
        summary: e.summary,
        analyzedInstructions: e.analyzedInstructions,
        userRecipe: e.userRecipe,
        email: e.email,
        dishTypes: e.Dishes.map(e => e.title.toLowerCase()),
        diets: e.Diets.map(e => e.title)
      }
    })

    let allApiResultsHelper

    let keysArray = [ API_KEY1, API_KEY2, API_KEY3, API_KEY4, API_KEY5 ] // length 5

    let j = 0

    do {
      allApiResultsHelper = await allApiResults({ key: keysArray[j], try: j + 1 })
      j += 1
    } while (allApiResultsHelper.ok === false && allApiResultsHelper.message === 'Expired key' && j < keysArray.length )

    const apiFilteredResult =
      req.query.title ?
      allApiResultsHelper.filter(e => e.title.toLowerCase().includes(req.query.title.toLowerCase())) :
      allApiResultsHelper;

    if (j === keysArray.length && allApiResultsHelper.ok === false) res.status(400).json({ status: 400, message: arrayFromDB, ok: false, try: j })
    else return res.status(200).json({ status: 200, message: arrayFromDB.concat(apiFilteredResult), ok: true, try: j })
  } catch(e) {
    res.status(400).json({'status': 400, 'error': e})
  }
});

router.delete('/detele', async (req, res) => {
  const { title } = req.query;


});

router.get('/recipes/:id', async (req, res) => {
  const { id } = req.params;
  var findByIDinDB;

  try {
    let allApiResultsHelper = await allApiResults()
    const apiFilteredResult = allApiResultsHelper.filter(e => e.id === id);

    if (apiFilteredResult[0] === undefined) {
      findByIDinDB = await Recipes.findByPk(id, {
        include: [
          {
            model: Diets,
            attributes: ['title'],
            through: {
              attributes: []
            }
          }/* ,
          {
            model: Dishes,
            attributes: ['title'],
            through: {
              attributes: []
            }
          } */
        ]
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

  } catch (e) {
    res.status(400).send('THERE ARE NOT RECIPES BY THAT ID.. :(')
  }
});

router.post('/recipes', async (req, res) => {
  const {
    title, image, healthScore, summary, email,
    dishes, diets, analyzedInstructions, fd_tkn
  } = req.body;
  const { fd_ck_tkn } = req.cookies;
  console.log("email", email, "fd_tkn", fd_tkn, "fd_ck_tkn", fd_ck_tkn)

  try {
    if (
      title.replaceAll(" ","").replaceAll("\n", "") === "" ||
      healthScore === "" ||
      summary.replaceAll(" ","").replaceAll("\n", "") === "" ||
      dishes.length === 0 ||
      diets.length === 0 ||
      analyzedInstructions.map(e => e.replaceAll(" ","").replaceAll("\n","")).some(e => e === "")
    ) return res.status(400).json({'status': 400})
    else if (fd_ck_tkn !== undefined && fd_tkn !== undefined && fd_ck_tkn !== fd_tkn) {
      res.clearCookie("fd_ck_tkn")
      return res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
    }
    else if (fd_ck_tkn !== undefined || fd_tkn !== undefined) {
      let checkUserResponse = await checkUser({ onlyCheck: true, res: res, fd_tkn: fd_tkn, fd_ck_tkn: fd_ck_tkn })
      if (checkUserResponse.userValid) {
        const createRecipe = await Recipes.create({
          title: title,
          healthScore: parseInt(healthScore),
          summary: summary,
          image: image,
          analyzedInstructions: analyzedInstructions,
          userRecipe: true,
          email: checkUserResponse.email
        });
        const relatedDiets = await Diets.findAll({
          where: { [Op.or]: [ { title: diets } ] }
        })
        const relatedDishes = await Dishes.findAll({
          where: { [Op.or]: [ { title: dishes } ] }
        })

        createRecipe.addDiets(relatedDiets)
        createRecipe.addDishes(relatedDishes)

        cloudinary.uploader.upload(image, { public_id: createRecipe.id, overwrite: true, invalidate: true })
        .then(async(res) => {
          const updateRecipe = await Recipes.findOne({
            where: { id: createRecipe.id }
          });
          updateRecipe.image = createRecipe.id;
          await updateRecipe.save();
        })
        .catch(async() => {
          const updateRecipe = await Recipes.findOne({
            where: { id: createRecipe.id }
          });
          updateRecipe.image = Math.ceil(Math.random() * 3);
          await updateRecipe.save();
        })
        res.cookie('fd_ck_tkn', checkUserResponse.fd_ck_tkn ? fd_ck_tkn : fd_tkn, checkUserResponse.options)
        return res.status(200).json({ 'status': 200 })
      } else {
        res.clearCookie("fd_ck_tkn")
        return res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
      }
    }
  } catch(e) {
    res.status(400).json({'status': 400, 'error': e})
  }
});

router.get('/diets', async (req, res) => { // THIS ROUTE ALWAYS RETURN DIETS.
  try {
    res.json(await Diets.bulkCreate([
      { title: "All Diets" },
      { title: "Gluten Free" },
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

router.get('/dishes', async (req, res) => { // THIS ROUTE ALWAYS RETURN DISHES.
  try {
    res.json(await Dishes.bulkCreate([
      { title: "All Dishes" },
      { title: "Side Dish" },
      { title: "Lunch" },
      { title: "Main course" },
      { title: "Main dish" },
      { title: "Dinner" },
      { title: "Morning Meal" },
      { title: "Brunch" },
      { title: "Breakfast" },
      { title: "Soup" },
      { title: "Salad" },
      { title: "Condiment" },
      { title: "Dip" },
      { title: "Sauce" },
      { title: "Spread" }
    ], {validate: true}))
  }
  catch(e) {
    try {
      const dishes = await Dishes.findAll()
      if (dishes.length === 0) res.status(400).send("No dishes")
      else res.status(200).send(dishes)
    } catch (e) {
      res.status(400).send('THERE ARE NOT AVAILABLE DISHES..')
    }
  }
});

router.post('/user', async (req, res) => {
  const { email, fd_tkn } = req.body;
  const { fd_ck_tkn } = req.cookies;
  console.log("email", email, "fd_tkn", fd_tkn, "fd_ck_tkn", fd_ck_tkn)

  try {
    return await checkUser({ res: res, fd_ck_tkn: fd_ck_tkn, fd_tkn: fd_tkn })
  } catch(err) {
    if (err.response.data.error_description === 'Invalid Credentials') {
      res.clearCookie("fd_ck_tkn")
      return res.status(400).json({ status: 400, message: err.response.data.error_description, ok: false })
    } else return res.status(400).json({ status: 400, message: "error", ok: false })
  }
});

module.exports = router;
