const serviceAccount = require('../archon-matrix-firebase.json');
const admin = require('firebase-admin');
require('firebase/firestore');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://archon-matrix.firebaseio.com"
});

const db = admin.firestore();

exports.db = db;
