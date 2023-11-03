const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const port = process.env.PORT || 3000

//conn.sync({ force: true }).then(() => server.listen(port, () => console.log(`OK! LISTENING AT PORT ${port} :)`))) // eslint-disable-line no-console
conn.sync({ force: false }).then(() => server.listen(port, () => console.log(`OK! LISTENING AT PORT ${port} :)`))) // eslint-disable-line no-console