var admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.cert({
        "project_id": process.env.PROJECT_ID,
        "private_key": process.env.PRIVATE_KEY,
        "client_email": process.env.CLIENT_EMAIL
   }),
    databaseURL: "https://vcanteen-d8ede.firebaseio.com/"
})

async function getUID(email) {
    var uid = null
    await admin.auth().getUserByEmail(email)
    .then(function(userRecord) {
        uid = userRecord.toJSON().uid
    })
    .catch(function(err) {})
    return uid
}


async function updatePassword(uid, pwd) {
    await admin.auth().updateUser(uid, {
        password: pwd,
    })
    .then(function(userRecord) {
        console.log('Successfully updated user', userRecord.toJSON());
      })
    .catch(function(error) {
        console.log('Error updating user:', error);
      });
}

module.exports = {
    getUID,
    updatePassword
}
