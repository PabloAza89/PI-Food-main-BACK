const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Recipes', {
    id : {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey : true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    healthScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        max: 100,
        min: 0
      }
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    analyzedInstructions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },
    userRecipe: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  }, {
    timestamps: false
  }
)};
