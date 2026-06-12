// Ganti dengan konfigurasi Firebase proyek Anda
// Dapatkan dari: Firebase Console > Project Settings > Your apps > Firebase SDK snippet
const firebaseConfig = {
  apiKey: "AIzaSyBa2-l_SzWd3FPcpPxT3Y8yhH-PxvMBp8E",
  authDomain: "lostnfound-kampus.firebaseapp.com",
  projectId: "lostnfound-kampus",
  storageBucket: "lostnfound-kampus.firebasestorage.app",
  messagingSenderId: "596578459101",
  appId: "1:596578459101:web:6626f6ec90bbfa0629ea34",
  measurementId: "G-76FC2T4MW1"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
