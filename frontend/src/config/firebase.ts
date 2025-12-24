import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7PmZQ1V_kgjTi-UC6OlJKThEQc4fEpg0",
  authDomain: "delivery-website-61899.firebaseapp.com",
  projectId: "delivery-website-61899",
  storageBucket: "delivery-website-61899.firebasestorage.app",
  messagingSenderId: "1023625285959",
  appId: "1:1023625285959:web:22dc9a38e008c1d3db3c62",
  measurementId: "G-PRGEE5GKTQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
// Enable account linking for Google
googleProvider.addScope('email');

// Configure Facebook provider
// Note: 'public_profile' is included by default
// Enable email scope for Facebook (requires App Review approval)
facebookProvider.addScope('email');
facebookProvider.setCustomParameters({
  display: 'popup'
});

export default app;
