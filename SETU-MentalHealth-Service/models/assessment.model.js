module.exports = (sequelize, DataTypes) => {
  const Assessment = sequelize.define('assessments', {
    id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title:     { type: DataTypes.STRING(200), allowNull: false },
    subTitle:  { type: DataTypes.STRING(400), allowNull: true },
    imageUrl:  { type: DataTypes.STRING(1000), allowNull: true },  // Renamed from imageKey to imageUrl
    status:    { type: DataTypes.ENUM('draft', 'active', 'archived'), defaultValue: 'active' },
  }, {
    tableName: 'assessments',
    timestamps: true,
  });

  return Assessment;
};
