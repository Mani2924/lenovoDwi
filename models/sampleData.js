/* eslint-disable no-unused-vars */
const { Model } = require('sequelize');
const config = require('../src/config/vars');

module.exports = (sequelize, DataTypes) => {
  class sampleData extends Model {}
  sampleData.init(
    {
      Op_Finish_Time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      dest_Operation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Associate_Id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Mfg_Order_Id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Serial_Num: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      line: {
        type: DataTypes.STRING,
      },
      Operation_Id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Work_Position_Id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'sampleData',
      schema: config.db.schema,
      freezeTableName: true,
      paranoid: true,
    },
  );

  sampleData.associate = function (models) {};
  return sampleData;
};
