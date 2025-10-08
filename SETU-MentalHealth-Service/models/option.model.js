module.exports = (sequelize, DataTypes) => {
  const Option = sequelize.define('options', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    questionId: { type: DataTypes.UUID, allowNull: false },
    text: { type: DataTypes.STRING(500), allowNull: false },
    value: { type: DataTypes.INTEGER, allowNull: false } // 0..3
  }, { indexes: [{ fields: ['questionId'] }] });

  return Option;
};
