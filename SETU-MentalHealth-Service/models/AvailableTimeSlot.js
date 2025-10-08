// models/availableTimeSlot.js
module.exports = (sequelize, DataTypes) => {
  const AvailableTimeSlot = sequelize.define(
    "AvailableTimeSlot",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // Location fields
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      pincode: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          // allow today; reject strictly past calendar days
          isNotPastDate(value) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const slotDate = new Date(value);
            if (slotDate < today) {
              throw new Error("Date cannot be in the past");
            }
          },
        },
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          // 30-min steps between 10:00:00 and 16:30:00 inclusive
          isValidTimeSlot(value) {
            if (!value) throw new Error("Time is required");
            const [h, m] = value.split(":").map(Number);
            if (!(m === 0 || m === 30)) {
              throw new Error("Time must be in 30-minute intervals (e.g., 10:00:00, 10:30:00)");
            }
            const total = h * 60 + m;
            if (total < 600 || total > 990) {
              throw new Error("Time must be between 10:00:00 and 16:30:00");
            }
          },
        },
      },
    },
    {
      tableName: "AvailableTimeSlots",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      indexes: [
        {
          unique: true,
          fields: ["date", "time", "city", "state", "pincode"],
          name: "uniq_date_time_location",
        },
        { fields: ["date"] },
        { fields: ["city"] },
        { fields: ["state"] },
        { fields: ["pincode"] },
      ],
    }
  );

  // Generate slots for a range at a specific location
  AvailableTimeSlot.generateTimeSlots = function (startDate, endDate, { city, state, pincode }) {
    if (!city || !state || !pincode) {
      throw new Error("city, state, and pincode are required");
    }

    const slots = [];
    const timeSlots = [
      "10:00:00", "10:30:00", "11:00:00", "11:30:00",
      "12:00:00", "12:30:00", "13:00:00", "13:30:00",
      "14:00:00", "14:30:00", "15:00:00", "15:30:00",
      "16:00:00", "16:30:00"
    ];

    const cur = new Date(startDate);
    const end = new Date(endDate);

    while (cur <= end) {
      const d = new Date(cur);
      const dateStr = d.toISOString().split("T")[0];

      timeSlots.forEach((time) => {
        slots.push({ date: dateStr, time, city, state, pincode });
      });

      cur.setDate(cur.getDate() + 1);
    }

    return slots;
  };

  return AvailableTimeSlot;
};
