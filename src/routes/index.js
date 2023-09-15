const cloudinary = require('cloudinary').v2
var cookieParser = require('cookie-parser')
const { Router } = require('express');
const axios = require('axios');
require('dotenv').config();
const { CLD_NAME, CLD_KEY, CLD_SECRET, API_KEY1 , API_KEY2 , API_KEY3 , API_KEY4 , API_KEY5 } = process.env;
const API_KEY = API_KEY1;
const NUMBER = 1;
const { Recipes , Diets , Op } = require('../db.js');

const router = Router();

let keys = [ API_KEY1, API_KEY2 ]

cloudinary.config({
  cloud_name: CLD_NAME,
  api_key: CLD_KEY,
  api_secret: CLD_SECRET
});

// let allApiResults = async () => {
//   const apiRawData = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY1}&number=${NUMBER}&addRecipeInformation=true`)
  
//   return apiRawData.data.results.map(e => {
//     return {
//       id: e.id,
//       title: e.title,
//       summary: e.summary,
//       healthScore: e.healthScore,
//       analyzedInstructions:
//         e.analyzedInstructions[0] ? e.analyzedInstructions[0].steps.map(e=> e.step) : [],
//       image: e.image,
//       diets: e.diets.map(function(e) {
//         if ((e.indexOf(e) !== e.length - 1)) {
//             return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
//         } else return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
//         }),
//       dishTypes: e.dishTypes,
//       userRecipe: false
//     }
//   })
// }

 let allApiResults = async (data) => {

   const apiRawData = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${data.key}&number=${NUMBER}&addRecipeInformation=true`)
      .then(res => { return res })
      .catch(err => { return err })

  //console.log("ejeje",apiRawData)
     console.log("Response bad", apiRawData.response && apiRawData.response.status) // bad = 402

  
  if (apiRawData.response && apiRawData.response.status === 402) return { status: 402, message: "Expired key", ok: false, try: data.try }
  
  /* else */
  /* else */
  /* else */ return apiRawData.data.results.map(e => {
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
//   //const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${data.key}&number=${NUMBER}&addRecipeInformation=true`)
//   const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY3}&number=${NUMBER}&addRecipeInformation=true`)
//     //.then(res => { return res })
//     //.catch(err => { return err })

//   console.log("Response bad", response.response.status) // bad = 402
//   console.log("Response good", response.status) // good = 200

//   console.log("Response 3", response.data)

//   //return response.data

//   return apiRawData.data.results.map(e => {
//         return {
//           id: e.id,
//           title: e.title,
//           summary: e.summary,
//           healthScore: e.healthScore,
//           analyzedInstructions:
//             e.analyzedInstructions[0] ? e.analyzedInstructions[0].steps.map(e=> e.step) : [],
//           image: e.image,
//           diets: e.diets.map(function(e) {
//             if ((e.indexOf(e) !== e.length - 1)) {
//                 return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
//             } else return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
//             }),
//           dishTypes: e.dishTypes,
//           userRecipe: false
//         }
//       })

//   // if (response.response.status === 402) return { status: 402, message: "Expired key", ok: false, try: data.try }
//   // else if (response.status === 200) {
//   //   return response.data.results.map(e => {
//   //     return {
//   //       id: e.id,
//   //       title: e.title,
//   //       summary: e.summary,
//   //       healthScore: e.healthScore,
//   //       analyzedInstructions:
//   //         e.analyzedInstructions[0] ? e.analyzedInstructions[0].steps.map(e=> e.step) : [],
//   //       image: e.image,
//   //       diets: e.diets.map(function(e) {
//   //         if ((e.indexOf(e) !== e.length - 1)) {
//   //             return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
//   //         } else return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
//   //         }),
//   //       dishTypes: e.dishTypes,
//   //       userRecipe: false
//   //     }
//   //   })
//   // }
//   //else return response

//   //return response

//   //console.log("Response", response)

  

//   //else return response
//   // else return response.data.results.map(e => {
//   //   return {
//   //     id: e.id,
//   //     title: e.title,
//   //     summary: e.summary,
//   //     healthScore: e.healthScore,
//   //     analyzedInstructions:
//   //       e.analyzedInstructions[0] ? e.analyzedInstructions[0].steps.map(e=> e.step) : [],
//   //     image: e.image,
//   //     diets: e.diets.map(function(e) {
//   //       if ((e.indexOf(e) !== e.length - 1)) {
//   //           return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
//   //       } else return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
//   //       }),
//   //     dishTypes: e.dishTypes,
//   //     userRecipe: false
//   //   }
//   // })

}

//console.log("a ver este", allApiResults(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY1}&number=${NUMBER}&addRecipeInformation=true`))

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


        let allApiResultsHelper// = await allApiResults({ key: API_KEY1, try: 1 })


        console.log("1 allApiResultsHelper", allApiResultsHelper)


        let qq = [ API_KEY2, API_KEY2, API_KEY2, API_KEY2, API_KEY2, API_KEY2, API_KEY2, API_KEY3, API_KEY2 ]

        let j = 0

          
        
          do {
            allApiResultsHelper = await allApiResults({ key: qq[j], try: j + 1 })
            console.log("2 allApiResultsHelper", allApiResultsHelper)
            j += 1

          } while (allApiResultsHelper.ok === false && allApiResultsHelper.message === 'Expired key')
       
          const apiFilteredResult =
            req.query.title ?
            allApiResultsHelper.filter(e => e.title.toLowerCase().includes(req.query.title.toLowerCase())) :
            allApiResultsHelper;

          return res.status(200).json({ status: 200, message: arrayFromDB.concat(apiFilteredResult), ok: true, try: j })
        
    }
    catch (err) {
      //console.log("api error", err.response.status)
      //console.log("api error", err)
      //console.log("api error", err.response.data.code) // 402
      //console.log("api error", err.response.data) // 402
      
        
        //if (err.response.data.code === 402) res.status(400).json({ status: 400, message: "Expired key", ok: false })
        //else res.status(400).json({ status: 400, message: "Error", ok: false })
        
    }
});

router.get('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    var findByIDinDB;

    try {
        //if (true) {
            let allApiResultsHelper = await allApiResults()
            const apiFilteredResult = allApiResultsHelper.filter(e => e.id === id);

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
        //}
    }
    catch (e) {
        res.status(400).send('THERE ARE NOT RECIPES BY THAT ID.. :(')
    }
});

router.post('/recipes', async (req, res) => {

  const {
    title, image, healthScore, summary,
    diets, analyzedInstructions, email
  } = req.body;

  console.log("image",image)

  try {
    if (
      title.replaceAll(" ","").replaceAll("\n", "") === "" ||
      healthScore === "" ||
      summary.replaceAll(" ","").replaceAll("\n", "") === "" ||
      diets.length === 0 ||
      analyzedInstructions.map(e => e.replaceAll(" ","").replaceAll("\n","")).some(e => e === "") ||
      email.replaceAll(" ","").replaceAll("\n", "") === ""
    ) res.status(400).json({'status': 400})
    else {

        const createRecipe = await Recipes.create({
          title: title,
          healthScore: parseInt(healthScore),
          summary: summary,
          image: image,
          analyzedInstructions: analyzedInstructions,
          userRecipe: true,
          email: email
        });
      const relatedDiets = await Diets.findAll({
          where: { [Op.or]: [ { title: diets } ] }
      })

      createRecipe.addDiets(relatedDiets)

      cloudinary.uploader.upload(image, { public_id: createRecipe.id, overwrite: true, invalidate: true })
      .then(async(res) => {
        console.log("RES", res)
        const updateRecipe = await Recipes.findOne({
          where: { id: createRecipe.id }
        });
        updateRecipe.image = createRecipe.id;
        await updateRecipe.save();
      })
      .catch(async() => {
        //console.log(ere)
        const updateRecipe = await Recipes.findOne({
          where: { id: createRecipe.id }
        });
        updateRecipe.image = Math.ceil(Math.random() * 3);
        await updateRecipe.save();
      })

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

router.post('/user', async (req, res) => {
  const { email, token } = req.body;
  console.log("email", email, "token", token, "fd_tkn", req.cookies.fd_tkn)

  try {
    const minutes = 2880 // 1 hour = 60 // 12 hours = 720 // 1 day = 1440 // 7 days = 10080
      let options = {
        path: "/",
        expires: new Date(Date.now() + (60 * 1000 * minutes)),
        //domain: 'localhost:3001',
        httpOnly: true
      }

    if (req.cookies.fd_tkn && !token) {
      let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${req.cookies.fd_tkn}`)

      if (response.data.email !== undefined) {
        res.cookie('fd_tkn', req.cookies.fd_tkn, options)
        res.status(200).json({ email: response.data.email, token: req.cookies.fd_tkn, status: 200 })
      }
    }

    if (!req.cookies.fd_tkn && token) {
      res.cookie('fd_tkn', token, options)
      res.status(200).json({ status: 200 })
    }

  }
  catch(err) {
    if (err.response.data.error_description === 'Invalid Credentials') {
      res.clearCookie("fd_tkn")
      return res.status(400).json({ status: 400, message: err.response.data.error_description, ok: false })
    } else return res.status(400).json({ status: 400, message: "error", ok: false })
  }
});

module.exports = router;
