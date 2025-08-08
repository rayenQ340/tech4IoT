const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');
const bcrypt = require('bcrypt');

const _User = sequelize.define('_User', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  FullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      const salt = bcrypt.genSaltSync(12);
      const hash = bcrypt.hashSync(value, salt);
      this.setDataValue('Password', hash);
    }
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'unique_email',
      msg: 'Email address already in use'
    },
    validate: {
      isEmail: true,
      notEmpty: true
    },
    set(value) {
      // Force lowercase and trim whitespace
      this.setDataValue('Email', value.toString().toLowerCase().trim());
    }
  },
  Region: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  PhoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['Email']
    }
  ]
});

// Password comparison method
_User.prototype.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.Password);
};

module.exports = _User;