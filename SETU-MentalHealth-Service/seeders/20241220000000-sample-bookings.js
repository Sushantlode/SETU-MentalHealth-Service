'use strict';

const moment = require('moment');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sampleBookings = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        fullName: 'John Doe',
        age: 30,
        gender: 'male',
        phoneNumber: '+1234567890',
        email: 'john.doe@example.com',
        houseNumber: '123',
        streetName: 'Main Street',
        landmark: 'Near Central Park',
        city: 'New York',
        pincode: '10001',
        state: 'New York',
        scheduleDate: moment().add(1, 'day').format('YYYY-MM-DD'),
        scheduleTime: '10:00:00',
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        fullName: 'Jane Smith',
        age: 25,
        gender: 'female',
        phoneNumber: '+1987654321',
        email: 'jane.smith@example.com',
        houseNumber: '456',
        streetName: 'Oak Avenue',
        landmark: 'Opposite Library',
        city: 'Los Angeles',
        pincode: '90210',
        state: 'California',
        scheduleDate: moment().add(2, 'days').format('YYYY-MM-DD'),
        scheduleTime: '14:30:00',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        fullName: 'Mike Johnson',
        age: 35,
        gender: 'male',
        phoneNumber: '+1122334455',
        email: 'mike.johnson@example.com',
        houseNumber: '789',
        streetName: 'Pine Road',
        landmark: 'Near Shopping Mall',
        city: 'Chicago',
        pincode: '60601',
        state: 'Illinois',
        scheduleDate: moment().add(3, 'days').format('YYYY-MM-DD'),
        scheduleTime: '11:00:00',
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        fullName: 'Sarah Wilson',
        age: 28,
        gender: 'female',
        phoneNumber: '+1555666777',
        email: 'sarah.wilson@example.com',
        houseNumber: '321',
        streetName: 'Elm Street',
        landmark: 'Behind Hospital',
        city: 'Houston',
        pincode: '77001',
        state: 'Texas',
        scheduleDate: moment().add(1, 'day').format('YYYY-MM-DD'),
        scheduleTime: '15:00:00',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        fullName: 'Alex Brown',
        age: 42,
        gender: 'other',
        phoneNumber: '+1999888777',
        email: 'alex.brown@example.com',
        houseNumber: '654',
        streetName: 'Maple Drive',
        landmark: 'Near School',
        city: 'Phoenix',
        pincode: '85001',
        state: 'Arizona',
        scheduleDate: moment().add(4, 'days').format('YYYY-MM-DD'),
        scheduleTime: '09:30:00',
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('QuantificationDeviceBooking', sampleBookings, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('QuantificationDeviceBooking', null, {});
  }
};
