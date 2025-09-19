module.exports = (sequelize, DataTypes) => {
  const UserSkillTeach = sequelize.define('UserSkillTeach', {
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
    tableName: 'user_skills_teach',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'skill_id']
      }
    ]
  });

  return UserSkillTeach;
};