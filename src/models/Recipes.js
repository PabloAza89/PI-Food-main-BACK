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
    summary: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    healthScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        max: 100,
        min: 0
      }
    },
    analyzedInstructions: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: false
  }
)};
