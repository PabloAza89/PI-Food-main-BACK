const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Diets', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { 
        notAlpha(value) {
          if (!/^[\w ]+$/i.test(value)) {
            throw new Error('Only A-Z and 0-9 values are allowed !');
          }
        }
      }  
    },
  }, {
    timestamps: false
  }
)};