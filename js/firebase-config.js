// ============================================
// NESTIFY — Firebase Configuration
// Central Firebase initialization module
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB3n4oRMttZP3hEstN1WhQIUSfnMcNK3o",
  authDomain: "stayfinder-india.firebaseapp.com",
  projectId: "stayfinder-india",
  storageBucket: "stayfinder-india.firebasestorage.app",
  messagingSenderId: "645510509071",
  appId: "1:645510509071:web:d9924d4780d3f185a5e97a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Log successful initialization
console.log('%c🔥 Firebase Initialized', 'color: #ff6b00; font-size: 14px; font-weight: bold;');
console.log('%c📦 Project: stayfinder-india', 'color: #b0b0b0; font-size: 11px;');

// ============================================
// Firestore Helper Functions
// ============================================

/**
 * Fetch all approved listings
 * @param {number} limitCount - Max number of listings to fetch
 * @returns {Promise<Array>} Array of listing objects
 */
async function getApprovedListings(limitCount = 50) {
  try {
    const listingsRef = collection(db, "listings");
    const q = query(
      listingsRef,
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    const listings = [];
    snapshot.forEach((docSnap) => {
      listings.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    console.log(`✅ Fetched ${listings.length} approved listings`);
    return listings;
  } catch (error) {
    console.error("❌ Error fetching approved listings:", error);

    // Fallback: try without orderBy (in case composite index isn't ready)
    try {
      console.log("🔄 Retrying without orderBy...");
      const listingsRef = collection(db, "listings");
      const q = query(
        listingsRef,
        where("status", "==", "approved")
      );
      const snapshot = await getDocs(q);

      const listings = [];
      snapshot.forEach((docSnap) => {
        listings.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      // Sort client-side
      listings.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      console.log(`✅ Fallback: Fetched ${listings.length} approved listings`);
      return listings;
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      return [];
    }
  }
}

/**
 * Fetch featured listings (approved + featured)
 * @param {number} limitCount - Max number of listings
 * @returns {Promise<Array>}
 */
async function getFeaturedListings(limitCount = 8) {
  try {
    const listingsRef = collection(db, "listings");
    const q = query(
      listingsRef,
      where("status", "==", "approved"),
      where("featured", "==", true),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    const listings = [];
    snapshot.forEach((docSnap) => {
      listings.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    console.log(`⭐ Fetched ${listings.length} featured listings`);
    return listings;
  } catch (error) {
    console.error("❌ Error fetching featured listings:", error);
    return [];
  }
}

/**
 * Fetch a single listing by ID
 * @param {string} listingId
 * @returns {Promise<Object|null>}
 */
async function getListingById(listingId) {
  try {
    const docRef = doc(db, "listings", listingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`✅ Fetched listing: ${listingId}`);
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn(`⚠️ Listing not found: ${listingId}`);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching listing:", error);
    return null;
  }
}

/**
 * Increment view count for a listing
 * @param {string} listingId
 */
async function incrementViewCount(listingId) {
  try {
    const docRef = doc(db, "listings", listingId);
    await updateDoc(docRef, {
      viewsCount: increment(1)
    });
  } catch (error) {
    console.error("❌ Error incrementing views:", error);
  }
}

/**
 * Fetch all listings (for admin - no status filter)
 * @returns {Promise<Array>}
 */
async function getAllListings() {
  try {
    const listingsRef = collection(db, "listings");
    const snapshot = await getDocs(listingsRef);

    const listings = [];
    snapshot.forEach((docSnap) => {
      listings.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Sort by date client-side
    listings.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    console.log(`✅ Fetched ${listings.length} total listings`);
    return listings;
  } catch (error) {
    console.error("❌ Error fetching all listings:", error);
    return [];
  }
}

// ============================================
// Exports
// ============================================
export {
  app,
  db,
  auth,
  storage,
  // Firestore methods (re-export for convenience)
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  // Custom helper functions
  getApprovedListings,
  getFeaturedListings,
  getListingById,
  incrementViewCount,
  getAllListings
};