//let db = ["Side Dish", "Lunch", "Main Course", "Main Dish", "Dinner"]
//let db = ["Side Dish", "Lunch", "Main Course"]
//let db = ["Cena", "Tarde", "Lunchs"]
let qq = [
  { id: '012e621f-011e-48b6-be18-a80ad48e607e', title: 'Side Dish' },
  { id: '3434b4ec-a33a-49a8-ac98-d660ce8114bd', title: 'Lunch' },
  { id: 'e2d56595-f8d5-4890-a651-1998e71618e1', title: 'Main Course' },
  { id: 'b3ac7941-028e-4778-998f-7b3d8e1550dc', title: 'Main Dish' }
]

console.log(
  //resultParsed
  qq.filter(e => e.title === "Main Dish")[0]

)