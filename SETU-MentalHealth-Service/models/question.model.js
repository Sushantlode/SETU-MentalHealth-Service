module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('questions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    assessmentId: { type: DataTypes.UUID, allowNull: false },
    text: { type: DataTypes.STRING(1000), allowNull: false },
    order: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { indexes: [{ fields: ['assessmentId'] }, { fields: ['order'] }] });

  return Question;
};
