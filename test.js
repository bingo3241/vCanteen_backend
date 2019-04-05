const firebase = require('./db/firebase')

var email = 'bingo6689@gmail.com'
async function getUID(email) {
    var uid = await firebase.getUID(email)
    console.log('UID: '+uid)
}

async function changeEmail(email, pwd) {
    var uid = await firebase.getUID(email);
    await firebase.updatePassword(uid, pwd)
}

getUID('bingo6689@gmail.com')

changeEmail(email, 'test1234')
