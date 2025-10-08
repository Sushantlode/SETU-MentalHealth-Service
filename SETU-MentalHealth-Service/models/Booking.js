const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Full name must be between 2 and 100 characters'
        },
        notEmpty: {
          msg: 'Full name is required'
        }
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Age must be at least 1'
        },
        max: {
          args: [120],
          msg: 'Age cannot exceed 120'
        },
        isInt: {
          msg: 'Age must be a whole number'
        }
      }
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer not to say'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['male', 'female', 'other', 'prefer not to say']],
          msg: 'Gender must be one of: male, female, other, prefer not to say'
        }
      }
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: 'Phone number must be in valid international format'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Email must be in valid format'
        }
      }
    },
    // Address fields
    houseNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'House number is required'
        },
        len: {
          args: [1, 20],
          msg: 'House number must be between 1 and 20 characters'
        }
      }
    },
    streetName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Street name is required'
        },
        len: {
          args: [2, 200],
          msg: 'Street name must be between 2 and 200 characters'
        }
      }
    },
    landmark: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: 'Landmark cannot exceed 200 characters'
        }
      }
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'City is required'
        },
        len: {
          args: [2, 100],
          msg: 'City must be between 2 and 100 characters'
        }
      }
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        is: {
          args: /^[0-9]{6}$/,
          msg: 'Pincode must be exactly 6 digits'
        },
        notEmpty: {
          msg: 'Pincode is required'
        }
      }
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'State is required'
        },
        len: {
          args: [2, 100],
          msg: 'State must be between 2 and 100 characters'
        }
      }
    },
    scheduleDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isFutureDate(value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const bookingDate = new Date(value);
          if (bookingDate < today) {
            throw new Error('Schedule date cannot be in the past');
          }
        }
      }
    },
    scheduleTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        isValidTime(value) {
          if (!value) {
            throw new Error('Schedule time is required');
          }
          // Validate time format (HH:MM:SS)
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
          if (!timeRegex.test(value)) {
            throw new Error('Schedule time must be in valid format (HH:MM:SS)');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'confirmed', 'cancelled', 'completed']],
          msg: 'Status must be one of: pending, confirmed, cancelled, completed'
        }
      }
    }
  }, {
    tableName: 'QuantificationDeviceBooking',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      beforeCreate: (booking) => {
        if (!booking.id) {
          booking.id = uuidv4();
        }
      }
    }
  });

  // Instance methods
  Booking.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return values;
  };

  // Virtual field for combined date and time
  Booking.prototype.getScheduleDateTime = function() {
    if (this.scheduleDate && this.scheduleTime) {
      const dateTime = new Date(this.scheduleDate + 'T' + this.scheduleTime);
      return dateTime.toISOString();
    }
    return null;
  };

  // Virtual field for full address
  Booking.prototype.getFullAddress = function() {
    const addressParts = [
      this.houseNumber,
      this.streetName,
      this.landmark,
      this.city,
      this.pincode,
      this.state
    ].filter(part => part && part.trim());
    
    return addressParts.join(', ');
  };

  // Class methods
  Booking.findByDateRange = function(startDate, endDate) {
    return this.findAll({
      where: {
        scheduleDate: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      order: [['scheduleDate', 'ASC'], ['scheduleTime', 'ASC']]
    });
  };

  Booking.findByStatus = function(status) {
    return this.findAll({
      where: { status },
      order: [['scheduleDate', 'ASC'], ['scheduleTime', 'ASC']]
    });
  };

  Booking.findByDate = function(date) {
    return this.findAll({
      where: { scheduleDate: date },
      order: [['scheduleTime', 'ASC']]
    });
  };

  Booking.searchByName = function(name) {
    return this.findAll({
      where: {
        fullName: {
          [sequelize.Op.iLike]: `%${name}%`
        }
      },
      order: [['scheduleDate', 'ASC'], ['scheduleTime', 'ASC']]
    });
  };

  Booking.findByCity = function(city) {
    return this.findAll({
      where: {
        city: {
          [sequelize.Op.iLike]: `%${city}%`
        }
      },
      order: [['scheduleDate', 'ASC'], ['scheduleTime', 'ASC']]
    });
  };

  Booking.findByPincode = function(pincode) {
    return this.findAll({
      where: { pincode },
      order: [['scheduleDate', 'ASC'], ['scheduleTime', 'ASC']]
    });
  };

  return Booking;
};
