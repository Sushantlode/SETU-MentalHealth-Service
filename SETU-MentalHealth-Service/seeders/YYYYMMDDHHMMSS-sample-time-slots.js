'use strict';

const moment = require('moment');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const timeSlots = [
      '10:00:00', '10:30:00', '11:00:00', '11:30:00',
      '12:00:00', '12:30:00', '13:00:00', '13:30:00',
      '14:00:00', '14:30:00', '15:00:00', '15:30:00',
      '16:00:00', '16:30:00', '17:00:00', '17:30:00'
    ];

    const sampleTimeSlots = [];
    const startDate = moment().format('YYYY-MM-DD');
    const endDate = moment().add(30, 'days').format('YYYY-MM-DD');

    const currentDate = moment(startDate);
    const end = moment(endDate);

    while (currentDate.isSameOrBefore(end)) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      
      for (const time of timeSlots) {
        sampleTimeSlots.push({
          id: require('uuid').v4(),
          date: dateStr,
          time: time,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      currentDate.add(1, 'day');
    }

    await queryInterface.bulkInsert('AvailableTimeSlots', sampleTimeSlots, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('AvailableTimeSlots', null, {});
  }
};
