module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profile_picture: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  User.associate = (models) => {
    // User has many skills through user_skills table
    User.hasMany(models.UserSkill, {
      foreignKey: 'user_id',
      as: 'userSkills'
    });

    // User can have many matches (as requester)
    User.hasMany(models.Match, {
      foreignKey: 'requester_id',
      as: 'requestedMatches'
    });

    // User can have many matches (as receiver)
    User.hasMany(models.Match, {
      foreignKey: 'receiver_id',
      as: 'receivedMatches'
    });

    // User can send many chats
    User.hasMany(models.Chat, {
      foreignKey: 'sender_id',
      as: 'sentChats'
    });

    // User can receive many chats
    User.hasMany(models.Chat, {
      foreignKey: 'receiver_id',
      as: 'receivedChats'
    });

    // User can have many credits
    User.hasMany(models.Credit, {
      foreignKey: 'user_id',
      as: 'credits'
    });

    // User can write reviews
    User.hasMany(models.Review, {
      foreignKey: 'reviewer_id',
      as: 'writtenReviews'
    });

    // User can receive reviews
    User.hasMany(models.Review, {
      foreignKey: 'reviewed_id',
      as: 'receivedReviews'
    });

    // User can have OTP verifications
    User.hasMany(models.OtpVerification, {
      foreignKey: 'user_id',
      as: 'otpVerifications'
    });

    // User can create many quizzes
    User.hasMany(models.Quiz, {
      foreignKey: 'created_by',
      as: 'createdQuizzes'
    });
  };

  return User;
};