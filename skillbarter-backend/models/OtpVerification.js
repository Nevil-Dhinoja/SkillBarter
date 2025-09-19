module.exports = (sequelize, DataTypes) => {
  const OtpVerification = sequelize.define('OtpVerification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    otp_code: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    otp_type: {
      type: DataTypes.ENUM('registration', 'password_reset'),
      defaultValue: 'registration'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'otp_verifications',
    timestamps: false,
    indexes: [
      {
        fields: ['email', 'otp_type']
      },
      {
        fields: ['expires_at']
      }
    ]
  });

  OtpVerification.associate = (models) => {
    OtpVerification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return OtpVerification;
};