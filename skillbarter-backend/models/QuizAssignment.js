module.exports = (sequelize, DataTypes) => {
  const QuizAssignment = sequelize.define('QuizAssignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed'),
      defaultValue: 'pending'
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'quiz_assignments',
    timestamps: false
  });

  QuizAssignment.associate = (models) => {
    QuizAssignment.belongsTo(models.Quiz, {
      foreignKey: 'quiz_id',
      as: 'quiz'
    });

    QuizAssignment.belongsTo(models.User, {
      foreignKey: 'assigned_by',
      as: 'assigner'
    });

    QuizAssignment.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'assignee'
    });
  };

  return QuizAssignment;
};