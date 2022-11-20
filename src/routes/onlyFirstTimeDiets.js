// ONLY FOR FIRST MANUAL POST OF DIETS

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
        ]))
  }
  catch(e) {
      res.status(400).send('Las dietas ya estan precargadas')
  } 
});