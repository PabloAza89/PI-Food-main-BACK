const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const port = process.env.PORT || 3001

//conn.sync({ force: true }).then(() => {
conn.sync({ force: false }).then(() => {
  server.listen(port, () => {
    console.log(`OK! LISTENING AT PORT ${port} :)`); // eslint-disable-line no-console
  });
});

// conn.sync({ force: false }).then(() => {
//   server.listen(port, "0.0.0.0");
// });