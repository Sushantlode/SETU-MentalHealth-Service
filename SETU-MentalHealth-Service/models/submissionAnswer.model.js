module.exports = (sequelize, DataTypes) => {
  const SubmissionAnswer = sequelize.define('submission_answers', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    submissionId: { type: DataTypes.UUID, allowNull: false },
    questionId: { type: DataTypes.UUID, allowNull: false },
    optionId: { type: DataTypes.UUID, allowNull: false },
    value: { type: DataTypes.INTEGER, allowNull: false }
  }, { indexes: [{ fields: ['submissionId'] }, { fields: ['questionId'] }] });

  return SubmissionAnswer;
};
