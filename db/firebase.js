var admin = require('firebase-admin')
const functions = require('firebase-functions');
var { google } = require('googleapis');
var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

//var router = express.Router();
var request = require('request');

admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "vcanteen-d8ede",
        "private_key_id": "b4f4bced867ea815558ddffb09531174c5218640",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCYcVtmmwnqf9zz\nmGneE8whuoMVdTCU9SjQZm/hAkQP9jiDBA4T7bi9iofzkYssYbITKQTQQfteaNHY\n4MtwmpTaMx8N+BAKDcvMOWP+y20IhyJ9OgwQHA9gZPYF92D6Gsfn+V8DIbVeNTgq\nYSQu2JMaKi5XfNx3uh5EsyKELfOyDKg9ZJX0FjtIXO9xYmKo7U/EiR9H9/WJDDAI\nrlsqYCd2/9a5Z8Eyw/Ggv9BZFLlCzwhfIinVcGy1wrnIh2SX1y1y6Iv5STJm8/f0\nYvWLM84xgGa2/mFwLbaxUzWWBvgKyHK+eqvbXBlmb/RnE9/xXSGwAah1j/roDNvX\nIqmw8SZNAgMBAAECggEAN57kooNfEtikXZz2w7ileoj62xFvMGpjAebeW1LgUpKb\n+/G20T6jcUTiZdRs2zyqJKOKxhHNDZ1hM6iRkfxU42hTpF0mPQTbnyAxg/3lQn9L\n7jUHwbj7Q0iTG4ovMBIlblZmfFYIPt9cJtpawVz0D0/kqLc+GdEmyhoyNdguWoAD\nVRHg1uj5JCaW9ASt0KDBajJ9Ev+bSoGDvFg6kVobvRqDNCrNT5vRRZmc+W875QVd\nCRZugqJgMuoQSb71Bpeua5EI8guGFEQCs8C1jdq/bhAGv14Ooo5Sa8rz8UsliNEG\nm5iAMiY9KV+WyiH2n0oqmIVx6iaMD9WCfrpp/kWGYQKBgQDSAmnbhoSt4zw0yLik\nNp5neaHdNeDkn3N9Sl49T4FX6n7UEwa1Lnr+Ed6+AI8D+O5LfdFBaoMYeiq1As70\n/mYlL/t7Kg+Ws/bi13wdhz+cj6MI+oVt/bpi5Qgki5o0ylyC7wGPtJ9luXbjN/bC\ng77cqHMrnw57xyjw0EMO42UTWwKBgQC506IFGqR61yCcOeHSxhYv3LgS/dPD+oDS\nSNkUEwFFqj4H43eObo+vy75bXtCtntOcm4/c7fVDj4EH5ogO7gLAHI/VQGcr2JC/\n5XOMZ3kP4OgxHtRxmV3yprjejIhweU6Q3Rm+bLpPpMkaVHKrKUNgqjNVMACdzrzW\ngwJ0mMsldwKBgQCe1nR6NSPk4RmIUshUa3sjiDuEtFuEj5UqDjV46clKVXHXtQw9\nvQoJYDq4OnPw7TZOorrCX20H9l6Wyaj+Y+ud9MygOw/PTA5PQ+v76W+TWpBVGiYR\nKvbuFYwzF+NqSiPuZBcqOdLVfZEOCiX4uOyCuGVjeMnblKbCfMI7YIHyQQKBgDqS\nY2I6eJejkUrMz8ow17N0XazWxtXh8pLVlV7HcsIzm+O+peOGI9IkZTbFlv7yrf6R\n5fGcK4+E/wWvezlBeip1ljyAVUSzuURTHW2m+7iuimFZN1srHTqrpF+5ahQRmFr+\n5etot/z8ksqyzYX3tp4UZ6O1Qqx7CniOyMpZksaXAoGAZfs9GibzgBzlLvZOoOM9\nDdqkEVnl2DlB9lNTBrAufztjomuP2dD/O6O079k1ejrJpmr8CReoh+iQV/zw5ADh\naGurzD/789zrMK+N6OACmeUR2K+eP5jlYp8Hf4Emuy3uy7SxzZ0/AEhdpBsO0E/W\nHNHhUZIn+JshjMzyMK8fH6c=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-z90ma@vcanteen-d8ede.iam.gserviceaccount.com",
        "client_id": "115074786959453570828",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-z90ma%40vcanteen-d8ede.iam.gserviceaccount.com"
      
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
      var key = require("../service-account.json");
      var jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
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
