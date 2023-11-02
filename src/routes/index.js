const cloudinary = require('cloudinary').v2
const { Router } = require('express');
const { allApiResults, checkUser } = require('../controller/controller');
require('dotenv').config();
const { CLD_NAME, CLD_KEY, CLD_SECRET, API_KEY1 , API_KEY2 , API_KEY3 , API_KEY4 , API_KEY5 } = process.env;
const { Recipes , Diets , Dishes, Recipes_Dishes, Op } = require('../db.js');

const router = Router();

cloudinary.config({
  cloud_name: CLD_NAME,
  api_key: CLD_KEY,
  api_secret: CLD_SECRET
});

router.get('/recipes', async (req, res) => {

  try {
    const searchDBRecipes = await Recipes.findAll({
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

    let API_KEY9 = 2323

    //let keysArray = [ API_KEY9, API_KEY9, API_KEY9, API_KEY9, API_KEY9 ] // length 5
    let keysArray = [ API_KEY1, API_KEY1, API_KEY1, API_KEY1, API_KEY1 ] // length 5
    //let keysArray = [ API_KEY1, API_KEY2, API_KEY3, API_KEY4, API_KEY5 ] // length 5

    let j = 0

    do {
      allApiResultsHelper = await allApiResults({ key: keysArray[j], try: j + 1 })
      j += 1
    } while (allApiResultsHelper.ok === false && allApiResultsHelper.message === 'Expired key' && j < keysArray.length )

    const apiFilteredResult =
      req.query.title ?
      allApiResultsHelper.filter(e => e.title.toLowerCase().includes(req.query.title.toLowerCase())) :
      allApiResultsHelper;

    if (j === keysArray.length && allApiResultsHelper.ok === false) return res.status(400).json({ status: 400, message: arrayFromDB, ok: false, try: j })
    else return res.status(200).json({ status: 200, message: arrayFromDB.concat(apiFilteredResult), ok: true, try: j })
  } catch(e) {
    return res.status(400).json({'status': 400, 'error': e})
  }
});

router.delete('/delete', async (req, res) => {
  const { id, fd_tkn } = req.body; // food_token
  const { fd_ck_tkn } = req.cookies; // food_cookies_token
  console.log("fd_tkn", fd_tkn, "fd_ck_tkn", fd_ck_tkn)

  try {
    if (fd_ck_tkn !== undefined && fd_tkn !== undefined && fd_ck_tkn !== fd_tkn) {
      res.clearCookie("fd_ck_tkn")
      return res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
    }
    else if (fd_ck_tkn !== undefined || fd_tkn !== undefined) {
      let checkUserResponse = await checkUser({ onlyCheck: true, res: res, fd_tkn: fd_tkn, fd_ck_tkn: fd_ck_tkn })
      if (checkUserResponse.userValid) {
        const deletedItem = await Recipes.destroy({ where: { id: id } });
        if (deletedItem === 0) return res.status(400).json({ status: 400, message: `0 item deleted`, ok: false })
        if (deletedItem === 1) return res.status(200).json({ status: 200, message: `1 item deleted`, ok: true })
      } else {
        res.clearCookie("fd_ck_tkn")
        return res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
      }
    } else return res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
  } catch(err) {
    //return res.status(400).json({'status': 400, 'error': e})
    return res.status(400).json({ status: 400, message: err, ok: false })
  }
});

router.put('/recipe', async (req, res) => {
  const {
    title, image, healthScore, summary, email, id,
    dishes, diets, analyzedInstructions, fd_tkn // food_token
  } = req.body;
  const { fd_ck_tkn } = req.cookies; // food_cookies_token
  console.log("fd_tkn", fd_tkn, "fd_ck_tkn", fd_ck_tkn)
  console.log("EN PUT SERVER")
  console.log("IMAGE", image === "")

  //console.log("diets diets", diets)

  try {
    if (fd_ck_tkn && fd_tkn && fd_ck_tkn !== fd_tkn) {
      res.clearCookie("fd_ck_tkn")
      return res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
    }
    else if (fd_ck_tkn !== undefined || fd_tkn !== undefined) {
      let checkUserResponse = await checkUser({ onlyCheck: true, res: res, fd_tkn: fd_tkn, fd_ck_tkn: fd_ck_tkn })
      console.log("checkUserResponse.userValid", checkUserResponse.userValid)
      if (checkUserResponse.userValid) {

        if (image !== '') {
          cloudinary.uploader.upload(image, { public_id: id, overwrite: true, invalidate: true })
          .then(async(res) => {
            const updateRecipe = await Recipes.findOne({
              where: { id: id }
            });
            updateRecipe.image = id;
            await updateRecipe.save();
          })
          .catch(async() => {
            const updateRecipe = await Recipes.findOne({
              where: { id: id }
            });
            updateRecipe.image = Math.ceil(Math.random() * 3);
            await updateRecipe.save();
          })
        }

        const updatedItem = await Recipes.update(
          {
            title: title,
            healthScore: healthScore,
            summary: summary,
            analyzedInstructions: analyzedInstructions
          },
          { where: { id: id } }
        );

        const recipeFound = await Recipes.findOne({
          where: { [Op.or]: [ { id: id } ] }
        })

        const relatedDishes = await Recipes.findOne({
          where: { id: id },
          include: [
            {
              model: Dishes,
              attributes: [ 'id', 'title' ],
            }
          ]
        }).then((response) => {
          return response.Dishes.map((e) =>  { return { id: e.id, title: e.title }} )
        })
        .then(async (existingDishes) => {
          const dishesFound = await Dishes.findAll({
            where: { title: dishes }
          }).then(res => { return res.map((e) =>  { return { id: e.id, title: e.title }}) })

          let resultParsed = []
          existingDishes.map(async(e) => {
            if (dishes.map(f => f).includes(e.title) === true) resultParsed.push({ ...e, toDelete: false, toAdd: false }) // ALREADY EXISTS
            else if (dishes.map(f => f).includes(e.title) === false) resultParsed.push({ ...e, toDelete: true, toAdd: false }) // TO DELETE
          })

          dishes.filter((e) => {
            if ( existingDishes.map(f => f.title).includes(e) === false) {
              let dishID = dishesFound.filter(g => g.title === e)[0].id // RETRIEVES ID OF NEW DISH
              resultParsed.push({ id: dishID, title: e, toDelete: false, toAdd: true }) // PUSH NEW !
            }
          })
          return resultParsed
        })

        //console.log("A VER", dishesFound)
        //console.log("updatedItem", updatedItem[0])
        //console.log("updatedItem 2", updatedItem)
        //console.log("RELATED DISHES", relatedDishes)

        if (relatedDishes.length > 0) {
          relatedDishes.map(e => {
            if (e.toDelete) recipeFound.removeDishes(e.id)
            if (e.toAdd) recipeFound.addDishes(e.id)
          })
        }

        const relatedDiets = await Recipes.findOne({
          where: { id: id },
          include: [
            {
              model: Diets,
              attributes: [ 'id', 'title' ],
            }
          ]
        }).then((response) => {
          return response.Diets.map((e) =>  { return { id: e.id, title: e.title }} )
        })
        .then(async (existingDiets) => {
          const dietsFound = await Diets.findAll({
            where: { title: diets }
          }).then(res => { return res.map((e) =>  { return { id: e.id, title: e.title }}) })

          let resultParsed = []
          existingDiets.map(async(e) => {
            if (diets.map(f => f).includes(e.title) === true) resultParsed.push({ ...e, toDelete: false, toAdd: false }) // ALREADY EXISTS
            else if (diets.map(f => f).includes(e.title) === false) resultParsed.push({ ...e, toDelete: true, toAdd: false }) // TO DELETE
          })

          diets.filter((e) => {
            if ( existingDiets.map(f => f.title).includes(e) === false) {
              let dietsID = dietsFound.filter(g => g.title === e)[0].id // RETRIEVES ID OF NEW DIET
              resultParsed.push({ id: dietsID, title: e, toDelete: false, toAdd: true }) // PUSH NEW !
            }
          })
          console.log("A VER", dietsFound)
          return resultParsed
        })

        console.log("relatedDiets", relatedDiets)

        if (relatedDiets.length > 0) {
          relatedDiets.map(e => {
            if (e.toDelete) recipeFound.removeDiets(e.id)
            if (e.toAdd) recipeFound.addDiets(e.id)
          })
        }


        if (updatedItem[0] === 1) return res.status(200).json({ status: 200, message: `1 item updated`, ok: true })
      } else {
        res.clearCookie("fd_ck_tkn")
        return res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
      }
    } else return res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
  } catch(err) {
    //return res.status(400).json({'status': 400, 'error': e})
    return res.status(400).json({ status: 400, message: err, ok: false })
  }
});

router.post('/recipe', async (req, res) => {
  const {
    title, image, healthScore, summary, email,
    dishes, diets, analyzedInstructions, fd_tkn
  } = req.body;
  const { fd_ck_tkn } = req.cookies;
  console.log("email", email, "fd_tkn", fd_tkn, "fd_ck_tkn", fd_ck_tkn)

  try {
    // if (
    //   title.replaceAll(" ","").replaceAll("\n", "") === "" || // .replaceAll DON'T WORK IN SOME SERVERS !
    //   healthScore === "" ||                                   // REPLACED WITH RegExp/g & .replace
    //   summary.replaceAll(" ","").replaceAll("\n", "") === "" ||
    //   dishes.length === 0 ||
    //   diets.length === 0 ||
    //   analyzedInstructions.map(e => e.replaceAll(" ","").replaceAll("\n","")).some(e => e === "")
    // ) return res.status(400).json({'status': 400})
    if (
      title.replace(/ /g, "").replace(/\n/g, "") === "" ||
      healthScore === "" ||
      summary.replace(/ /g, "").replace(/\n/g, "") === "" ||
      dishes.length === 0 ||
      diets.length === 0 ||
      analyzedInstructions.map(e => e.replace(/ /g, "").replace(/\n/g, "")).some(e => e === "")
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
    //res.status(400).json({'status': 400, 'error': e})
    return res.status(400).json({'status': 400, 'error': e})
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
      { title: "Main Course" },
      { title: "Main Dish" },
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
    //], { validate: true, updateOnDuplicate: ["title"] }))
    ], { validate: true }))
  }
  catch(e) {
    //console.log("SOME ERRORRR")
    try {
      const dishes = await Dishes.findAll()
      if (dishes.length === 0) return res.status(400).send("No dishes")
      else return res.status(200).send(dishes)
    } catch (e) {
      return res.status(400).send('THERE ARE NOT AVAILABLE DISHES..')
    }
  }
});

router.post('/user', async (req, res) => {
  const { email, fd_tkn, overwrite } = req.body;
  const { fd_ck_tkn } = req.cookies;
  console.log("ENTRO EN POST USER email", email, "fd_tkn", fd_tkn, "fd_ck_tkn", fd_ck_tkn)

  try {
    return await checkUser({ res, fd_ck_tkn, fd_tkn, overwrite })
    //let response = await checkUser({ onlyCheck: false, res: res, fd_ck_tkn: fd_ck_tkn, fd_tkn: fd_tkn })
    //console.log("RESPONSE", response)
  } catch(err) {
    //console.log("ERR", err)
    if (err.response && err.response.data.error_description === 'Invalid Credentials') {
      res.clearCookie("fd_ck_tkn")
      return res.status(400).json({ status: 400, message: err.response.data.error_description, ok: false })
    } else return res.status(400).json({ status: 400, message: "Axios Error", ok: false })
  }
});

module.exports = router;
