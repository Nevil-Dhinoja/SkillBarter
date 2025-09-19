module.exports = (sequelize, DataTypes) => {
  const UserSkillLearn = sequelize.define('UserSkillLearn', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'user_skills_learn',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'skill_id']
      }
    ]
  });

  return UserSkillLearn;
};