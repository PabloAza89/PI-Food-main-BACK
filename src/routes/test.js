//let db = ["Side Dish", "Lunch", "Main Course", "Main Dish", "Dinner"]
//let db = ["Side Dish", "Lunch", "Main Course"]
//let db = ["Cena", "Tarde", "Lunchs"]
let db = [{id: 1, title:"Side Dish"},
   {id: 2, title:"Lunch"},
   {id: 3, title:"Main Course"},
   {id: 4, title:"Main Dish"},
   {id: 4, title:"Dinner"}
  ]

//let newData = ["Side Dish", "Lunch", "Dinner"]
let newData = ["Side Dish", "Lunch", "Dinner"]

let resultParsed = []

db.map(e => {
  if (newData.map(f => f).includes(e.title) === true) resultParsed.push({ ...e, toDelete: false, isNew: false }) // ALREADY EXISTS
  else if (newData.map(f => f).includes(e.title) === false) resultParsed.push({ ...e, toDelete: true, isNew: false }) // TO DELETE
})

newData.filter(e => {
  if (db.map(f => f.title).includes(e) === false) resultParsed.push({ id: 0, title: e, toDelete: false, isNew: true }) // NEW !
})



console.log(
  resultParsed
)