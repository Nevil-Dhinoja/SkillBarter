module.exports = (sequelize, DataTypes) => {
  const QuizQuestion = sequelize.define('QuizQuestion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    option1: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    option2: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    option3: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    option4: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    correct_option: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4
      }
    }
  }, {
    tableName: 'quiz_questions',
    timestamps: false
  });

  QuizQuestion.associate = (models) => {
    QuizQuestion.belongsTo(models.Quiz, {
      foreignKey: 'quiz_id',
      as: 'quiz'
    });
  };

  return QuizQuestion;
};