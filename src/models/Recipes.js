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
      allowNull: false
    },
    analyzedInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: false
  }
)};
