// const chai = require('chai');
// const expect = chai.expect;
// const userController = require('./../controllers/user.controller');

// // TC-204-3 Gebruiker-ID bestaat
// describe('Get all users', function() {
//     it('should return existing id', function(done) {
//         const userId = 1; // Replace with the ID of an existing user in your database

//         // Mock the getById method of the database to return user data
//         const getByIdStub = sinon.stub(database, 'getById').callsFake((id, callback) => {
//             // Simulate user data retrieval by calling the callback with user data
//             callback(null, { id: userId, firstName: 'Test', lastName: 'User', emailAdress: 'test@example.com' });
//         });

//         userController.getUserByID({ params: { id: userId } }, {
//             json: function(user) {
//                 expect(user).to.be.an('object');
//                 expect(user.id).to.equal(userId);
//                 expect(user.firstName).to.equal('Test');
//                 expect(user.lastName).to.equal('User');
//                 expect(user.emailAdress).to.equal('test@example.com');
//                 getByIdStub.restore(); // Restore the stub after the test
//                 done();
//             }
//         });
//     });
// });