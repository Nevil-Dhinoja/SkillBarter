module.exports = (sequelize, DataTypes) => {
  const QuizResult = sequelize.define('QuizResult', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('completed', 'in_progress', 'abandoned'),
      defaultValue: 'in_progress'
    },
    taken_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'quiz_results',
    timestamps: false
  });

  QuizResult.associate = (models) => {
    QuizResult.belongsTo(models.Quiz, {
      foreignKey: 'quiz_id',
      as: 'quiz'
    });

    QuizResult.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return QuizResult;
};