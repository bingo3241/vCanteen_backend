var admin = require('firebase-admin')
const functions = require('firebase-functions');
var { google } = require('googleapis');
var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

//var router = express.Router();
var request = require('request');

admin.initializeApp({
    credential: admin.credential.cert({
        "type": process.env.FIREBASE_TYPE,
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": process.env.FIREBASE_AUTH_URI,
        "token_uri": process.env.FIREBASE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
      
   }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
})


async function getUID(email) {
    return await new Promise(async function(resolve, reject) {
        await admin.auth().getUserByEmail(email)
        .then(function(userRecord) {
            var uid = userRecord.toJSON().uid
            console.log('GetUserByEmail success: '+uid)
            return resolve(uid)
        })
        .catch(function(err) {
            console.log('GetUserByEmail error: '+err)
            return reject(err)
        })
        
    })
    
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


function sendToFirebase(title, body, token) {

    getAccessToken().then(function (access_token) {
  
      // var title = req.body.title;
      // var body = req.body.body;
      // var token = req.body.token;
  
      request.post({
        headers: {
          Authorization: 'Bearer ' + access_token
        },
        url: "https://fcm.googleapis.com/v1/projects/vcanteen-d8ede/messages:send",
        body: JSON.stringify(
          {
            "message": {
              "token": token,
              "notification": {
                "body": body,
                "title": title,
              }
            }
          }
        )
      }, function (error, response, body) {
        //res.end(body);
        console.log(body);
      });
    });
  };
  
 
  
  function getAccessToken() {
    return new Promise(function (resolve, reject) {
      var jwtClient = new google.auth.JWT(
        process.env.FIREBASE_CLIENT_EMAIL,
        null,
        process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        SCOPES,
        null
      );
      jwtClient.authorize(function (err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
    });
  }

 // exports.api = functions.https.onRequest(app);

module.exports = {
    getUID,
    updatePassword,
    sendToFirebase
}