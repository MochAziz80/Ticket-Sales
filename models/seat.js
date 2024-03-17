'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class seat extends Model {
    static associate(models) {

      // define association here
      this.hasOne(models.ticket,{
        foreignKey: "seatID", as: "seatTicket"
      })

      this.belongsTo(models.event,{ foreignKey: 'eventID' })
    }
  }
  seat.init({
    seatID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    eventID: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    rowNum: DataTypes.STRING,
    seatNum: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'seat',
  });
  return seat;
};