import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCB3n4oRMttZP3hEstN1WhQIUSfnMcNK3o",
  authDomain: "stayfinder-india.firebaseapp.com",
  projectId: "stayfinder-india",
  storageBucket: "stayfinder-india.firebasestorage.app",
  messagingSenderId: "645510509071",
  appId: "1:645510509071:web:d9924d4780d3f185a5e97a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Force account selection every time
provider.setCustomParameters({ prompt: 'select_account' });


// ============================================
// LOGIN WITH GOOGLE
// ============================================
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    await handleUserAfterLogin(result.user);

  } catch (error) {
    console.error("Popup Login Error:", error.code, error.message);

    // Popup blocked or closed → fallback to redirect
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      console.log("Popup blocked — trying redirect...");
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        console.error("Redirect login error:", redirectError);
        showAuthError("Login failed. Please try again.");
      }

    } else if (error.code === 'auth/unauthorized-domain') {
      showAuthError(
        "Domain not authorized. Go to Firebase Console → Authentication → Settings → Authorized Domains → Add your domain (e.g. localhost or your site URL)."
      );
    } else {
      showAuthError("Login failed: " + (error.message || "Unknown error"));
    }
  }
}


// ============================================
// Handle User After Login
// ============================================
async function handleUserAfterLogin(user) {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // First time login — create user doc
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: "user",
        createdAt: new Date()
      });
    }

    const updatedSnap = await getDoc(userRef);
    const role = updatedSnap.data().role;

    console.log("Login success. Role:", role);
    redirectUser(role);

  } catch (error) {
    console.error("Firestore error after login:", error);
    showAuthError("Profile load failed. Redirecting...");
    setTimeout(() => { window.location.href = "index.html"; }, 2000);
  }
}


// ============================================
// Redirect Based on Role
// ============================================
function redirectUser(role) {
  if (role === "admin") {
    window.location.href = "admin-dashboard.html";
  } else if (role === "client") {
    window.location.href = "client-dashboard.html";
  } else {
    window.location.href = "index.html";
  }
}


// ============================================
// Check Auth State — call on login.html
// Handles both popup result and redirect result
// ============================================
export function checkAuth() {
  // Handle redirect result (for mobile / popup-blocked)
  getRedirectResult(auth)
    .then(async (result) => {
      if (result && result.user) {
        console.log("Redirect login result received");
        await handleUserAfterLogin(result.user);
      }
    })
    .catch((error) => {
      if (error.code !== 'auth/no-current-user') {
        console.error("Redirect result error:", error);
      }
    });

  // Watch ongoing auth state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const role = snap.data().role;
          const currentPage = window.location.pathname.split('/').pop();

          // Only auto-redirect when on login page
          if (currentPage === 'login.html' || currentPage === '') {
            redirectUser(role);
          }
        }
      } catch (err) {
        console.error("Auth state check error:", err);
      }
    }
  });
}


// ============================================
// Logout
// ============================================
export function logoutUser() {
  signOut(auth)
    .then(() => { window.location.href = "login.html"; })
    .catch((err) => { console.error("Logout error:", err); });
}


// ============================================
// Upgrade User to Client Role
// ============================================
export async function becomeClient() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, { role: "client" });
  window.location.href = "client-dashboard.html";
}


// ============================================
// Show Error Message on Login Page
// ============================================
function showAuthError(message) {
  const existing = document.getElementById('authError');
  if (existing) existing.remove();

  const errorDiv = document.createElement('div');
  errorDiv.id = 'authError';
  errorDiv.style.cssText = `
    background: rgba(255,61,61,0.15);
    border: 1px solid rgba(255,61,61,0.4);
    color: #ff6b6b;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    margin-top: 1rem;
    text-align: left;
    line-height: 1.5;
  `;
  errorDiv.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i>${message}`;

  const loginCard = document.querySelector('.login-card');
  if (loginCard) loginCard.appendChild(errorDiv);
}