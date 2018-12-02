import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";


var config = {
    apiKey: "AIzaSyDLsVpnuMbRjBTZGF5SM2Ip3mVJ_kV2YFc",
    authDomain: "slack-react-7d1fb.firebaseapp.com",
    databaseURL: "https://slack-react-7d1fb.firebaseio.com",
    projectId: "slack-react-7d1fb",
    storageBucket: "slack-react-7d1fb.appspot.com",
    messagingSenderId: "819720394288"
  };
  firebase.initializeApp(config);

  export default firebase;