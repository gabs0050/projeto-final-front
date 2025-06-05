// firebaseConfig.js
// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js"
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js"

const firebaseConfig = {
  apiKey: "AIzaSyBtsoC_CAVI_LV3i9wR2XCczgyU38bBBBs",
  authDomain: "projeto-final-front.firebaseapp.com",
  projectId: "projeto-final-front",
  storageBucket: "projeto-final-front.firebasestorage.app",
  messagingSenderId: "1092629193548",
  appId: "1:1092629193548:web:2101e9ad837523d02665e9",
  measurementId: "G-DCNMYET192"
}
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export { storage }
