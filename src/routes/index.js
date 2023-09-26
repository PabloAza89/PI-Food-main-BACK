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

  // function checkImage() {
  //   if (image !== "") return image: image
  // }

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
        console.log("updatedItem", updatedItem[0])
        console.log("updatedItem 2", updatedItem)



        // const recipeFound = await Recipes.findOne({
        //   where: { [Op.or]: [ { id: id } ] }
        //   //include: Dishes
        // })

        // const nonExistingPreviousDishes = await Dishes.findAll({
        //   //where: { [Op.or]: [ { title: dishes } ] }
        //   //where: { [Op.or]: [ { title: dishes } ] }
        //   //where: { [Op.or]: [ { title: ["Side Dish", "Lunch", "Main Course"] } ] }
        //   //where: { [Op.or]: [ { title: ["Side Dish", "Lunch", "Main Course"] } ] }
        //   where: { [Op.or]: [ { title: ["Side Dish", "Lunch", "Main Course", "Main Dish"] } ] }
        // }).then((existingDishes) => {
        //   return dishes.filter(e => !existingDishes.map(x => x.title).includes(e))
        // })

        // const relatedDishes = await Dishes.findAll({
        //   where: { [Op.or]: [ { title: dishes } ] }
        //   //where: { [Op.or]: [ { title: ["Side Dish", "Lunc", "Main Course", "Main Dish"] } ] }
        // })

        const relatedDishes = await Recipes.findOne({
          where: { id: id },
          include: [
            {
              model: Dishes,
              attributes: [ 'id', 'title' ],
            }
          ]
        }).then((response) => {
          //console.log("RESPON", response)
          return response.Dishes.map((e) =>  {return{ id:e.id, title: e.title}} )
        })
        .then((existingDishes) => {
          //return dishes.filter(e => !existingDishes.map(x => x.title).includes(e))
          db.filter(item => { return !neww.map(r => r.title).includes(item) }) // ARRAY TO DELETE
        })


        //console.log("QQQ QQQ", qqq.title)
        //console.log("QQQ QQQ", qqq.Dishes[0].title)
        //console.log("QQQ QQQ", qqq.Dishes[0].id)
        //console.log("QQQ QQQ", qqq.Dishes[0])
        //console.log("QQQ QQQ", qqq[0].Recipes_Dishes)
        //console.log("QQQ QQQ", qqq.Dishes)

        //console.log("QQQ QQQ", qqq.Dishes[0].Recipes_Dishes)
        // console.log("QQQ QQQ", 
        //   //qqq.Dishes.map(e => e.title)
        //   qqq.Dishes.map((e) => { return {id:e.id, title: e.title} })
        // )
        
        console.log("QQQ QQQ", relatedDishes)
        //console.log("QQQ QQQ", qqq.Dishes)

        //console.log("DISHES DISHES", relatedDishes[0].id)
        //console.log("DISHES DISHES", relatedDishes[0].title)
        //console.log("DISHES DISHES", relatedDishes)
        //console.log("DISHES DISHES", relatedDishes.length)

        // if (relatedDishes.length > 0) {
        //   relatedDishes.forEach((e) => {
        //     recipeFound.hasDishes(e.id).then((response) => {
        //     //test.hasDishes(dishes).then((res) => {
        //       if (response === true) console.log("true", e.id, e.title)
        //       //else console.log("false", e.id, e.title)
        //       else {
        //         //console.log("false", e.id, e.title)
        //         recipeFound.addDishes(e)
        //       }
        //     }).catch((err) => {
        //       //console.log("ERR ERR", err)
        //       console.log("SOME ERROR")
        //     })
        //   })
        // } else {
        //   console.log("NO DISHES RELATED FOUND") // NO MATCHES BECAUSE SOME ERROR..
        // }

        //recipeFound


        //console.log("DISHES DISHES", dishes.filter(e => !existingDiets.map(x => x.title).includes(e)))

        //  const rrelatedDishes = await Dishes.findAll({
        //   where: { [Op.or]: [ { title: dishes } ] }
        // })

        //let qq = ["Side Dish", "Lunch", "Main Course", "Main Dish", "Dinner"]
        // dishes

        //let toFilter = ["Lunch", "Main Course"]

        
          //let toAdd = dishes.filter(e => !existingDiets.includes(e))
          //let toAdd = dishes.filter(e => existingDiets.map(r => !r.title.includes(e)))

          //console.log("DISHES DISHES", existingDiets[0])
          

          //qq.filter(item => !toFilter.map(r => r.title).includes(item))
          //dishes.filter(e => !existingDiets.map(x => x.title).includes(e))
          
          

          //console.log("DISHES DISHES", existingDiets[0].title)


          //console.log("DISHES DISHES", toAdd)
        

        //console.log("test test", test[0].id)
        //console.log("test test", test.length)
        //console.log("test test", test.length === dishes.length)
        //console.log("test test", dishes[0])



        //console.log("test test", test)
        //console.log("rrelatedDishes rrelatedDishes", dishes)
        //console.log("dishes dishes", dishes)

        //if (test.length > 0) {
        //if (test.length > 0 && test.length === dishes.length) {
        // if (test.length > 0) { // test.length > 0 === THAT ARE THE SAME
        //   test.forEach((e) => {
        //     recipeFound.hasDishes(e.id).then((res) => {
        //     //test.hasDishes(dishes).then((res) => {
        //       //console.log("RES RES", res)
        //       console.log("TRUE", e.title)
        //     }).catch((err) => {
        //       //console.log("ERR ERR", err)
        //       console.log("FALSE", e.title)
        //     })
        //   })
        // } else {
        //   console.log("NO DISHES RELATED FOUND") // NO MATCHES BECAUSE SOME ERROR..
        // }

        
        // test.hasDishes("e2d56595-f8d5-4890-a651-1998e71618e1").then((res) => {
        // //test.hasDishes(dishes).then((res) => {
        //   //console.log("RES RES", res)
        //   console.log("TRUE")
        // }).catch((err) => {
        //   //console.log("ERR ERR", err)
        //   console.log("FALSE")
        // })

        //console.log("rrelatedDishes", rrelatedDishes)

        //  const testing = await Recipes.findAll({
        //   where: { [Op.or]: [ { id: id } ] }
        // })

        // testing.addDishes(rrelatedDishes)


        // const updatedDish = await Dishes.update(
        //   { id: rrelatedDishes },
        //   { where: { id: id }}
        // );
        

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
    return res.status(400).send('THERE ARE NOT RECIPES BY THAT ID.. :(')
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
    ], {validate: true}))
  }
  catch(e) {
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
  const { email, fd_tkn } = req.body;
  const { fd_ck_tkn } = req.cookies;
  console.log("email", email, "fd_tkn", fd_tkn, "fd_ck_tkn", fd_ck_tkn)
  console.log("ENTRO EN POST USER")


  try {
    return await checkUser({ res: res, fd_ck_tkn: fd_ck_tkn, fd_tkn: fd_tkn })
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
