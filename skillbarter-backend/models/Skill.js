module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('Skill', {
    skill_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    skill_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'skills',
    timestamps: false
  });

  Skill.associate = (models) => {
    // Skill has many user skills
    Skill.hasMany(models.UserSkill, {
      foreignKey: 'skill_id',
      as: 'userSkills'
    });

    // Skill can be referenced in reviews
    Skill.hasMany(models.Review, {
      foreignKey: 'skill_id',
      as: 'reviews'
    });
  };

  return Skill;
};