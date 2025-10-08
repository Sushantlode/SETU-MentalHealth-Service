module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define('submissions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    assessmentId: { type: DataTypes.UUID, allowNull: false },
    // userId (optional) if you add auth later
    totalScore: { type: DataTypes.INTEGER, allowNull: false },
    bandLabel: { type: DataTypes.STRING(100), allowNull: false },
    bandColor: { type: DataTypes.ENUM('green','blue','orange','red'), allowNull: false }
  }, { indexes: [{ fields: ['assessmentId'] }] });

  return Submission;
};
