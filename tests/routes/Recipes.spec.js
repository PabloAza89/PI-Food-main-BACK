/* eslint-disable import/no-extraneous-dependencies */
const { expect } = require('chai');
const session = require('supertest-session');
const app = require('../../src/app.js');
const { Recipes, conn } = require('../../src/db.js');

const agent = session(app);
const recipe = {
  title: "Food title",
  summary: "Food summary",
  healthScore: 100,
  analyzedInstructions: "Food instructions"
};

describe('Recipes route', () => {
  before(() => conn.authenticate()
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  }));
  beforeEach(() => Recipes.sync({ force: true })
    .then(() => Recipes.create(recipe)));
  describe('GET /recipes', () => {
    it('should get 200', () =>
      agent.get('/recipes').expect(200)
    );
  });
});
