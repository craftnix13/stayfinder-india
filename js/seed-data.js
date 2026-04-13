// ============================================
// NESTIFY — Seed Data Script
// Run ONCE to populate Firestore with sample listings
// 
// Usage: Open browser console on any page that loads
//        this module, or create a temp HTML page
// ============================================

import { db, collection, addDoc, serverTimestamp } from './firebase-config.js';

const sampleListings = [
  {
    title: "Horizon PG for Boys",
    type: "PG",
    price: 8500,
    location: "Kothrud",
    city: "Pune",
    lat: 18.5074,
    lng: 73.8077,
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"
    ],
    amenities: ["WiFi", "AC", "Meals", "Parking", "RO Water", "Power Backup"],
    ownerId: "demo_owner_1",
    ownerName: "Rajesh Patil",
    ownerPhone: "+919876543210",
    category: "boys",
    foodIncluded: true,
    ac: true,
    bathroom: "attached",
    status: "approved",
    verified: true,
    featured: true,
    viewsCount: 1240,
    leadsCount: 42,
    description: "Horizon PG offers premium accommodation for boys in the heart of Kothrud, Pune. Located just 5 minutes from Karve Road and close to multiple colleges and IT parks. All rooms are fully furnished with beds, wardrobes, study tables, and attached bathrooms. Home-cooked meals included — breakfast, lunch, and dinner. 24/7 security with CCTV surveillance.",
    securityDeposit: 8500,
    address: "42, Karve Road, Near Deccan, Kothrud, Pune - 411038"
  },
  {
    title: "Maple Studio Apartment",
    type: "Room",
    price: 12000,
    location: "Viman Nagar",
    city: "Pune",
    lat: 18.5679,
    lng: 73.9143,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop"
    ],
    amenities: ["WiFi", "Attached Bath", "TV", "Power Backup", "Kitchen"],
    ownerId: "demo_owner_1",
    ownerName: "Rajesh Patil",
    ownerPhone: "+919876543210",
    category: "coliving",
    foodIncluded: false,
    ac: true,
    bathroom: "attached",
    status: "approved",
    verified: true,
    featured: true,
    viewsCount: 890,
    leadsCount: 28,
    description: "Modern fully furnished studio apartment in the prime location of Viman Nagar. Walking distance from Phoenix Mall and Pune Airport. Features a private bathroom, kitchen, and balcony. Ideal for working professionals.",
    securityDeposit: 24000,
    address: "Near Phoenix Mall, Viman Nagar, Pune - 411014"
  },
  {
    title: "Green Valley PG for Girls",
    type: "PG",
    price: 7000,
    location: "Hinjewadi",
    city: "Pune",
    lat: 18.5912,
    lng: 73.7380,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop"
    ],
    amenities: ["WiFi", "Meals", "Security", "CCTV", "Housekeeping", "Geyser"],
    ownerId: "demo_owner_2",
    ownerName: "Priya Shah",
    ownerPhone: "+919876543211",
    category: "girls",
    foodIncluded: true,
    ac: false,
    bathroom: "shared",
    status: "approved",
    verified: true,
    featured: false,
    viewsCount: 650,
    leadsCount: 18,
    description: "Safe and comfortable PG for girls in Hinjewadi Phase 1. Just 2 mins walk from Rajiv Gandhi Infotech Park. 24/7 CCTV surveillance, female warden, and homemade food. Ideal for IT professionals.",
    securityDeposit: 7000,
    address: "Near Rajiv Gandhi IT Park, Phase 1, Hinjewadi, Pune"
  },
  {
    title: "Urban Nest Co-Living Space",
    type: "PG",
    price: 15000,
    location: "Baner",
    city: "Pune",
    lat: 18.5590,
    lng: 73.7868,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop"
    ],
    amenities: ["WiFi", "AC", "Gym", "Parking", "Laundry", "RO Water", "Power Backup", "Housekeeping"],
    ownerId: "demo_owner_3",
    ownerName: "Amit Desai",
    ownerPhone: "+919876543212",
    category: "coliving",
    foodIncluded: true,
    ac: true,
    bathroom: "attached",
    status: "approved",
    verified: true,
    featured: true,
    viewsCount: 2100,
    leadsCount: 89,
    description: "Premium co-living space in Baner with world-class amenities. Includes gym, co-working space, rooftop lounge, and community events. Perfect for young professionals who value community living.",
    securityDeposit: 30000,
    address: "Baner-Pashan Link Road, Baner, Pune - 411045"
  },
  {
    title: "Sunshine Boys PG",
    type: "PG",
    price: 6500,
    location: "Wakad",
    city: "Pune",
    lat: 18.5992,
    lng: 73.7637,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=300&fit=crop"
    ],
    amenities: ["WiFi", "Meals", "Geyser", "RO Water"],
    ownerId: "demo_owner_4",
    ownerName: "Vikram Joshi",
    ownerPhone: "+919876543213",
    category: "boys",
    foodIncluded: true,
    ac: false,
    bathroom: "shared",
    status: "approved",
    verified: false,
    featured: false,
    viewsCount: 420,
    leadsCount: 15,
    description: "Affordable PG for boys in Wakad. Close to Hinjewadi IT Park. Basic but clean rooms with home-cooked vegetarian meals included. Good for budget-conscious students and freshers.",
    securityDeposit: 6500,
    address: "Near Datta Mandir Chowk, Wakad, Pune"
  },
  {
    title: "Premium Furnished Room",
    type: "Room",
    price: 18000,
    location: "Koregaon Park",
    city: "Pune",
    lat: 18.5362,
    lng: 73.8932,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop"
    ],
    amenities: ["WiFi", "AC", "Attached Bath", "TV", "Parking", "Housekeeping", "Power Backup"],
    ownerId: "demo_owner_5",
    ownerName: "Sneha Rao",
    ownerPhone: "+919876543214",
    category: "coliving",
    foodIncluded: false,
    ac: true,
    bathroom: "attached",
    status: "approved",
    verified: true,
    featured: true,
    viewsCount: 1800,
    leadsCount: 56,
    description: "Luxurious fully furnished room in the upscale Koregaon Park area. Premium interiors, attached bathroom with rain shower, smart TV, and high-speed WiFi. Walking distance to restaurants and cafes.",
    securityDeposit: 36000,
    address: "Lane 7, Koregaon Park, Pune - 411001"
  },
  {
    title: "Comfort PG for Girls",
    type: "PG",
    price: 5500,
    location: "Hadapsar",
    city: "Pune",
    lat: 18.5089,
    lng: 73.9260,
    images: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop"
    ],
    amenities: ["WiFi", "Security", "CCTV", "Geyser", "RO Water"],
    ownerId: "demo_owner_2",
    ownerName: "Priya Shah",
    ownerPhone: "+919876543211",
    category: "girls",
    foodIncluded: false,
    ac: false,
    bathroom: "shared",
    status: "approved",
    verified: false,
    featured: false,
    viewsCount: 310,
    leadsCount: 8,
    description: "Budget-friendly PG for girls near Magarpatta City. Safe environment with 24/7 CCTV and female warden. Close to Hadapsar bus stand and EON IT Park.",
    securityDeposit: 5500,
    address: "Near Magarpatta City, Hadapsar, Pune"
  },
  {
    title: "Royal PG - Premium Stay",
    type: "PG",
    price: 9500,
    location: "Aundh",
    city: "Pune",
    lat: 18.5580,
    lng: 73.8075,
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop"
    ],
    amenities: ["WiFi", "AC", "Meals", "Gym", "Laundry", "Parking"],
    ownerId: "demo_owner_3",
    ownerName: "Amit Desai",
    ownerPhone: "+919876543212",
    category: "boys",
    foodIncluded: true,
    ac: true,
    bathroom: "attached",
    status: "approved",
    verified: true,
    featured: false,
    viewsCount: 920,
    leadsCount: 34,
    description: "Premium PG in Aundh with top-notch amenities. AC rooms with attached bathrooms, gym access, and delicious homemade meals. Near Aundh IT Park and University of Pune.",
    securityDeposit: 19000,
    address: "DP Road, Near Bremen Chowk, Aundh, Pune - 411007"
  }
];

/**
 * Seed Firestore with sample listings
 */
async function seedListings() {
  console.log('🌱 Starting to seed Firestore with sample listings...');

  let successCount = 0;
  let errorCount = 0;

  for (const listing of sampleListings) {
    try {
      const docRef = await addDoc(collection(db, "listings"), {
        ...listing,
        createdAt: serverTimestamp()
      });
      console.log(`✅ Added: ${listing.title} (ID: ${docRef.id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add ${listing.title}:`, error);
      errorCount++;
    }
  }

  console.log('');
  console.log('🌱 Seeding Complete!');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('');

  if (successCount > 0) {
    alert(`✅ Successfully added ${successCount} sample listings to Firestore!\n\nRefresh the page to see them.`);
  }

  return { successCount, errorCount };
}

// Make it callable from console
window.seedListings = seedListings;

// Auto-run if URL has ?seed=true
if (window.location.search.includes('seed=true')) {
  seedListings();
}

export { seedListings, sampleListings };