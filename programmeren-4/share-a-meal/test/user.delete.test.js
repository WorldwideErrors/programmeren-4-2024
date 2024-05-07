// const chai = require('chai');
// const sinon = require('sinon');
// const expect = chai.expect;
// const userController = require('./../controllers/user.controller'); // Update the path accordingly
// const database = require('./../dtb/inmem-db');

// // TC-206-4 Gebruiker succesvol verwijderd
// describe('User successfully deleted', function() {
//     it('should delete the user from the database', function(done) {
//         const deleteUserStub = sinon.stub(database, 'delete').callsFake((user, callback) => {
//             // Simulate successful deletion by calling the callback without an error
//             callback(null, user);
//         });

//         const userIdToDelete = 1;

//         userController.deleteUser({ params: { id: userIdToDelete } }, {
//             json: function(result) {
//                 expect(result).to.deep.equal({ message: 'User successfully deleted' });
//                 // Ensure that the delete method was called with the correct user
//                 expect(deleteUserStub.calledWith({ id: userIdToDelete })).to.be.true;
//                 // Restore the stub after the test
//                 deleteUserStub.restore();
//                 done();
//             }
//         });
//     });
// });