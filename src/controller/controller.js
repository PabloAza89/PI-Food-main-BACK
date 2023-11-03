const axios = require('axios');
const NUMBER = 1; // AMOUNT OF RECIPES REQUESTED

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
    //domain: '127.0.0.1', // DONT set domain in localhost
    //domain: 'https://pabloaza89.github.io',
    httpOnly: true,
    sameSite: 'none', // remember set this if front and back domains are different
    secure: true // remember set this if front and back domains are different
  }

  if (props.overwrite && props.fd_tkn) {
    let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${props.fd_tkn}`)
      if (response.data.email !== undefined) {
        console.log("overwrite:ok")
        props.res.cookie('fd_ck_tkn', props.fd_tkn, options)
        return props.res.status(200).json({ email: response.data.email, fd_tkn: props.fd_tkn, status: 200 })
      } else {
        console.log("overwrite:error")
        props.res.clearCookie("fd_ck_tkn")
        return props.res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
      }
  }

  if (props.onlyCheck) {
    if (props.fd_ck_tkn !== undefined) {
      let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${props.fd_ck_tkn}`)
        .then(res => { return res })
        .catch(err => { return err })
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
  } else { // THIS HANDLER SET USER, UPPER ONLY CHECK IF USER IS VALID
    if (props.fd_ck_tkn && !props.fd_tkn || (props.fd_ck_tkn && props.fd_tkn && props.fd_ck_tkn === props.fd_tkn)) {
      let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${props.fd_ck_tkn}`)
      if (response.data.email !== undefined) { // VALID USER
        console.log("LOG 1")
        props.res.cookie('fd_ck_tkn', props.fd_ck_tkn, options)
        return props.res.status(200).json({ email: response.data.email, fd_tkn: props.fd_ck_tkn, status: 200 })
      } else { // NOT VALID USER
        console.log("LOG 2")
        props.res.clearCookie("fd_ck_tkn")
        return props.res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
      }
    }
    else if (props.fd_ck_tkn && props.fd_tkn && props.fd_ck_tkn !== props.fd_tkn) {
      let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${props.fd_tkn}`)
      if (response.data.email !== undefined) { // edit
        console.log("LOG 3")
        props.res.cookie('fd_ck_tkn', props.fd_tkn, options)
        return props.res.status(200).json({ email: response.data.email, fd_tkn: props.fd_tkn, status: 200 })
      } else {
        console.log("LOG 4")
        props.res.clearCookie("fd_ck_tkn")
        return props.res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
      }
    }
    else if (!props.fd_ck_tkn && props.fd_tkn) { // food_cookie_token // food_token
      console.log("LOG 5")

      let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${props.fd_tkn}`)
      if (response.data.email !== undefined) { // edit
        console.log("LOG 5-1")
        props.res.cookie('fd_ck_tkn', props.fd_tkn, options)
        return props.res.status(200).json({ email: response.data.email, fd_tkn: props.fd_tkn, status: 200 })
      } else {
        console.log("LOG 5-2")
        props.res.clearCookie("fd_ck_tkn")
        return props.res.status(400).json({ status: 400, message: `Invalid Credentials`, ok: false })
      }
    }
    else if (!props.fd_ck_tkn && !props.fd_tkn) { // food_cookie_token // food_token
      console.log("LOG 6")
      return props.res.status(400).json({ status: 400, message: `User not logged`, ok: false })
    }
    else {
      console.log("LOG 7")
      return props.res.status(400).json({ status: 400, message: `Logging error`, ok: false })
    }
  }
}

module.exports = { allApiResults, checkUser }