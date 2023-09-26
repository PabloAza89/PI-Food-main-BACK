const axios = require('axios');
const NUMBER = 1;

const allApiResults = async (props) => {
  const apiRawData = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${props.key}&number=${NUMBER}&addRecipeInformation=true`)
    .then(res => { return res }) // ONLY WAY TO HANDLE BAD RESPONSE
    .catch(err => { return err }) // ONLY WAY TO HANDLE BAD RESPONSE

  if (apiRawData.response && apiRawData.response.status === 402) return { status: 402, message: "Expired key", ok: false, try: props.try }
  else return apiRawData.data && apiRawData.data.results.map(e => {
    return {
      id: e.id,
      title: e.title,
      summary: e.summary,
      healthScore: e.healthScore,
      analyzedInstructions:
        e.analyzedInstructions[0] ?
        e.analyzedInstructions[0].steps.map(e=> e.step) :
        [],
      image: e.image,
      diets:
        e.diets.map(function(e) {
          if ((e.indexOf(e) !== e.length - 1)) return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
          else return e.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
        }),
      dishTypes: e.dishTypes,
      userRecipe: false
    }
  })
}

const checkUser = async (props) => {
  const minutes = 2880 // 1 hour = 60 // 12 hours = 720 // 1 day = 1440 // 7 days = 10080
  let options = {
    path: "/",
    expires: new Date(Date.now() + (60 * 1000 * minutes)),
    //domain: 'localhost:3001',
    httpOnly: true
  }

  if (props.onlyCheck) {
    //if (props.fd_ck_tkn !== undefined && props.fd_tkn !== undefined && props.fd_ck_tkn !== props.fd_tkn) return { userValid: false }
    if (props.fd_ck_tkn !== undefined) {
      let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${props.fd_ck_tkn}`)
        .then(res => { return res })
        .catch(err => { return err })
      //console.log("RESPONSE", response)
      if (response.data && response.data.email !== undefined) {
        return {
          userValid: true,
          fd_ck_tkn: true,
          fd_tkn: false,
          email: response.data.email,
          options: options
        }
      } else return { userValid: false }
    } else if (props.fd_tkn !== undefined) {
      let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${props.fd_tkn}`)
      if (response.data && response.data.email !== undefined) {
        return {
          userValid: true,
          fd_ck_tkn: false,
          fd_tkn: true,
          email: response.data.email,
          options: options
        }
      } else return { userValid: false }
    }
  } else {
    //console.log("props.fd_ck_tkn", props.fd_ck_tkn)
    //console.log("props.fd_tkn", props.fd_tkn === '')
    if (props.fd_ck_tkn && !props.fd_tkn || props.fd_ck_tkn && props.fd_tkn) {
      
      let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${props.fd_ck_tkn}`)
      if (response.data.email !== undefined) { // edit
        console.log("ENTRO ACA 1")
        props.res.cookie('fd_ck_tkn', props.fd_ck_tkn, options)
        return props.res.status(200).json({ email: response.data.email, fd_tkn: props.fd_ck_tkn, status: 200 })
      } else {
        console.log("ENTRO ACA 2")
        props.res.clearCookie("fd_ck_tkn")
        return props.res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
      }
    }
    else if (!props.fd_ck_tkn && props.fd_tkn) { // food_cookie_token // food_token
      console.log("ENTRO ACA 3")
      props.res.cookie('fd_ck_tkn', props.fd_tkn, options)
      return props.res.status(200).json({ status: 200 })
    }
    else if (!props.fd_ck_tkn && !props.fd_tkn) { // food_cookie_token // food_token
      console.log("ENTRO ACA 4")
      //props.res.cookie('fd_ck_tkn', props.fd_tkn, options)
      //return props.res.status(200).json({ status: 200 })
      return props.res.status(400).json({ status: 400, message: `User not logged`, ok: false })
    }
    else {
      console.log("ENTRO ACA 5")
      //res.clearCookie("fd_ck_tkn")
      return props.res.status(400).json({ status: 400, message: `Logging error`, ok: false })
    }
  }
}

module.exports = { allApiResults, checkUser }