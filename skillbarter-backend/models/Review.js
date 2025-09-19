module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'CASCADE'
    },
    reviewed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'CASCADE'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'skills',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'reviews',
    timestamps: false
  });

  Review.associate = (models) => {
    Review.belongsTo(models.User, {
      foreignKey: 'reviewer_id',
      as: 'reviewer'
    });

    Review.belongsTo(models.User, {
      foreignKey: 'reviewed_id',
      as: 'reviewed'
    });

    Review.belongsTo(models.Skill, {
      foreignKey: 'skill_id',
      as: 'skill'
    });
  };

  return Review;
};