const axios = require('axios');
const NUMBER = 1;

const allApiResults = async (props) => {
  const apiRawData = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${props.key}&number=${NUMBER}&addRecipeInformation=true`)
    .then(res => { return res })
    .catch(err => { return err })

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
  } else {
    if (props.fd_ck_tkn && !props.fd_tkn) {
      let response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${props.fd_ck_tkn}`)
      if (response.data.email !== undefined) {
        props.res.cookie('fd_ck_tkn', props.fd_ck_tkn, options)
        return props.res.status(200).json({ email: response.data.email, fd_tkn: props.fd_ck_tkn, status: 200 })
      }
    }
    else if (!props.fd_ck_tkn && props.fd_tkn) { // food_cookie_token // food_token
      props.res.cookie('fd_ck_tkn', props.fd_tkn, options)
      return props.res.status(200).json({ status: 200 })
    }
  }
}

module.exports = { allApiResults, checkUser }