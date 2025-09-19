module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define('Quiz', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'quizzes',
    timestamps: false
  });

  Quiz.associate = (models) => {
    Quiz.belongsTo(models.Skill, {
      foreignKey: 'skill_id',
      as: 'skill'
    });

    Quiz.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    Quiz.hasMany(models.QuizQuestion, {
      foreignKey: 'quiz_id',
      as: 'questions'
    });

    Quiz.hasMany(models.QuizResult, {
      foreignKey: 'quiz_id',
      as: 'results'
    });
  };

  return Quiz;
};