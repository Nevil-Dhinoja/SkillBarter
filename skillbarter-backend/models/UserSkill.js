module.exports = (sequelize, DataTypes) => {
  const UserSkill = sequelize.define('UserSkill', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'CASCADE'
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'skills',
        key: 'skill_id'
      },
      onDelete: 'CASCADE'
    },
    skill_type: {
      type: DataTypes.ENUM('teach', 'learn'),
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    tableName: 'user_skills',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'skill_id', 'skill_type']
      }
    ]
  });

  UserSkill.associate = (models) => {
    UserSkill.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    UserSkill.belongsTo(models.Skill, {
      foreignKey: 'skill_id',
      as: 'skill'
    });
  };

  return UserSkill;
};