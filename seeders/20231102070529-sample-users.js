'use strict';
let md5 = require('md5')
const now = new Date()
/** @type {import('sequelize-cli').Migration} */
module.exports = {
async up (queryInterface, Sequelize) {
await queryInterface.bulkInsert('users', [
{
firstname: "albus",
lastname: "dumbledore",
email: "albus@gmail.com",
password: md5("12345"),
role : "admin",
createdAt : now,
updatedAt : now
},
{
firstname: "harry",
lastname: "potter",
email: "harry@gmail.com",
password: md5("12345"),
role : "user",
createdAt : now,
updatedAt : now
},
{
firstname: "ron",
lastname: "weasly",
email: "ron@gmail.com",
password: md5("12345"),
role : "user",
createdAt : now,
updatedAt : now
}
])
},
async down (queryInterface, Sequelize) {
await queryInterface.bulkDelete('users', null, {});
}
};