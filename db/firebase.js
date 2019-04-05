var admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.cert({
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL
   }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
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
