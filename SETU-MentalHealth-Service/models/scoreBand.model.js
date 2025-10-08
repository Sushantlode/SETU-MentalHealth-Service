module.exports = (sequelize, DataTypes) => {
  const ScoreBand = sequelize.define('score_bands', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    assessmentId: { type: DataTypes.UUID, allowNull: false },
    label: { type: DataTypes.STRING(100), allowNull: false }, // Minimal, Mild, ...
    minScore: { type: DataTypes.INTEGER, allowNull: false },
    maxScore: { type: DataTypes.INTEGER, allowNull: false },
    color: { type: DataTypes.ENUM('green','blue','orange','red'), allowNull: false },
    recommendation: { type: DataTypes.TEXT, allowNull: true }
  }, { indexes: [{ fields: ['assessmentId'] }, { fields: ['minScore','maxScore'] }] });

  return ScoreBand;
};
