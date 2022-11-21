const { Recipes , conn } = require('../../src/db.js');
const { expect } = require('chai');

describe('Recipes Model', () => {
  before(() => conn.authenticate()
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    }));
  describe('Validators', () => {
    beforeEach(() => Recipes.sync({ force: true }));
    describe('Title & Summary & Health Score & Instructions', () => {
      it('Should throw an error if "Title" or "Summary" or "Health Score" or "Instructions" is null', (done) => {
        Recipes.create({
          title: "Food title",
          summary: null,
          healthScore: 100,
          analyzedInstructions: "Food instructions"
        })
        .then(() => done(new Error('It requires that "Title" or "Summary" or "Health Score" or "Instructions" be valid')))
        .catch(() => done())
      });
      it('Should work when "Title" & "Summary" & "Health Score" & "Instructions" are valid', (done) => {
        Recipes.create({
          title: "Food title",
          summary: "Food summary",
          healthScore: 100,
          analyzedInstructions: "Food instructions"
        })
        .then(() => done())
        .catch(() => done(new Error('It requires that "Title" or "Summary" or "Health Score" or "Instructions" be valid')))
      });
    });
  });
});
