//let db = ["Side Dish", "Lunch", "Main Course", "Main Dish", "Dinner"]
//let db = ["Side Dish", "Lunch", "Main Course"]
//let db = ["Cena", "Tarde", "Lunchs"]
let db = [{id: 1, title:"Side Dish"},
   {id: 2, title:"Lunch"},
   {id: 3, title:"Main Course"},
   //{id: 4, title:"Main Dish"},
   //{id: 4, title:"Dinner"}
  ]

//let db = ["Side Dish"]

//let qq = ["Side Dish"]
//let qq = ["Lunch", "Side Dish"]

//let toFilter = ["Side Dish", "Lunch", "Main Course", "Main Dish", "Dinner"]
//let toFilter = ["Lunch", "Side Dish"]
//let neww = ["Lunch", "Side Dish"]
//let newData = ["Side Dish", "Lunch", "Dinner"]
let newData = ["Side Dish", "Lunch", "Dinner"]
//let neww = [{id: 1, title:"Lunch"}]

let toDelete = []

//toDelete.push(db.filter(e => { return !newData.map(r => r).includes(e.title) }))

// db.map(e => {
//   if (newData.map(r => r).includes(e.title) === true) {
//     //toDelete.push(e) // EXISTING
//     toDelete.push({...e, delete: false}) // EXISTING
//   }
//   else if (newData.map(r => r).includes(e.title) === false) {

//     //toDelete.push(e) // EXISTING

//     if (db.map(x => x.title).includes(e.title) === true) {
//       toDelete.push({...e, delete: true}) // EXISTING

//     } else {
//       toDelete.push({...e, delete: true})
//     }

     
    
//   }
  

//     //newData.filter(e => { return !db.map(x => x.title).includes(e) })
//     //newData.filter(z => { return !db.map(x => x.title).includes(z) })

// })

db.map(e => {
  if (newData.map(r => r).includes(e.title) === true) toDelete.push({ ...e, toDelete: false, isNew: false }) // ALREADY EXISTS
  else if (newData.map(r => r).includes(e.title) === false) toDelete.push({ ...e, toDelete: true, isNew: false }) // TO DELETE
})



newData.filter(r => {
  if (db.map(x => x.title).includes(r) === false) toDelete.push({ id: 0, title: r, toDelete: false, isNew: true }) // NEW !
})



console.log(
  
  
  //newData.filter(e => { return !db.map(x => x.title).includes(e) })
  

  toDelete


)