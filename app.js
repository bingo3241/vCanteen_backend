var config = {
  apiKey: "AIzaSyD_ywwYWpPByXN6xXchGeFahXfIemmttQo",
  authDomain: "vcanteen-d8ede.firebaseapp.com",
  databaseURL: "https://vcanteen-d8ede.firebaseio.com",
  projectId: "vcanteen-d8ede",
  storageBucket: "vcanteen-d8ede.appspot.com",
  messagingSenderId: "865311215719"
};

firebase.initializeApp(config);

firebase.auth.Auth.Persistence.LOCAL;

$("#btn-login").click(function () {
  var email = $("#email").val();
  var password = $("#password").val();

  var result = firebase.auth().signInWithEmailAndPassword(email, password);

  result.catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;

    console.log(errorCode);
    console.log(errorMessage);
  });
});