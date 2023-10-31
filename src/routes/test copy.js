//let db = ["Side Dish", "Lunch", "Main Course", "Main Dish", "Dinner"]
//let db = ["Side Dish", "Lunch", "Main Course"]
//let db = ["Cena", "Tarde", "Lunchs"]
let qq = [
  {
    id: '670c886d-dca6-4507-be41-cac9d5bccd48',
    title: 'Side Dish',
    toDelete: false,
    toAdd: false
  },
  {
    id: 'ee795fd7-899b-4e36-a14b-ccfbf8ac48d2',
    title: 'Main Course',
    toDelete: false,
    toAdd: false
  },
  {
    id: '5dedb72b-bbfe-4865-b408-31a371e3d54e',
    title: 'Lunch',
    toDelete: false,
    toAdd: true
  },
  {
    id: 'ndedb72b-bbfe-4865-b408-31a371e3d54e',
    title: 'Test',
    toDelete: true,
    toAdd: false
  },
  {
    id: 'ydedb72b-bbfe-4865-b408-31a371e3d54e',
    title: 'Test 2',
    toDelete: true,
    toAdd: false
  }
]

//let ww = qq.filter(e => (!e.toDelete && !e.toAdd || !e.toDelete && e.toAdd))

console.log(
  //resultParsed
  //qq.map(e => {if( !e.toDelete && !e.toAdd || !e.toDelete && e.toAdd ) return e.id} )
  //ww
  qq.map(e => {if(!e.toDelete && !e.toAdd || !e.toDelete && e.toAdd) return e.id}).filter(e => e !== undefined)

)