module.exports = (sequelize, DataTypes) => {
  const Performance = sequelize.define('Performance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    avg_score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0
    },
    quizzes_taken: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    highest_score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0
    },
    lowest_score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0
    }
  }, {
    tableName: 'performance',
    timestamps: false
  });

  Performance.associate = (models) => {
    Performance.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Performance;
};