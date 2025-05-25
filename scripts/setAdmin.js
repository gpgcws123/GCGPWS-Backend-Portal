const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function setUserAsAdmin(uid) {
    try {
        // Update user document in Firestore
        await admin.firestore()
            .collection('students')
            .doc(uid)
            .set({
                role: 'admin',
                updatedAt: new Date()
            }, { merge: true });

        console.log(`Successfully set user ${uid} as admin`);
    } catch (error) {
        console.error('Error setting admin role:', error);
    }
}

// Replace 'YOUR_USER_UID' with the actual Firebase UID of the user you want to make admin
const userUid = process.argv[2];

if (!userUid) {
    console.error('Please provide a user UID as an argument');
    process.exit(1);
}

setUserAsAdmin(userUid)
    .then(() => process.exit(0)); 