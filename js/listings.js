// ============================================
// NESTIFY — Listings Page (listings.html)
// Fetches and renders approved listings from Firestore
// ============================================

import { getApprovedListings, db, collection, query, where, getDocs, orderBy } from './firebase-config.js';

// ---- DOM Elements ----
const listingsGrid = document.getElementById('listingsGrid');
const resultsCount = document.getElementById('resultsCount');
const filterBtn = document.getElementById('filterBtn');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const acFilter = document.getElementById('acFilter');
const foodFilter = document.getElementById('foodFilter');
const sortSelect = document.getElementById('sortSelect');

// ---- State ----
let allListings = [];
let filteredListings = [];

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📋 Listings page initializing...');
  await loadListings();
  setupEventListeners();
});

// ============================================
// Load Listings from Firestore
// ============================================
async function loadListings() {
  // Show loading skeletons
  showLoadingState();

  try {
    allListings = await getApprovedListings(100);

    if (allListings.length === 0) {
      showEmptyState();
      return;
    }

    filteredListings = [...allListings];
    renderListings(filteredListings);
    updateResultsCount(filteredListings.length);

  } catch (error) {
    console.error("❌ Failed to load listings:", error);
    showErrorState();
  }
}

// ============================================
// Render Listings into Grid
// ============================================
function renderListings(listings) {
  if (!listingsGrid) return;

  if (listings.length === 0) {
    showNoResultsState();
    return;
  }

  listingsGrid.innerHTML = listings.map(listing => createListingCard(listing)).join('');

  // Re-attach wishlist listeners
  attachWishlistListeners();
}

// ============================================
// Create Single Listing Card HTML
// ============================================
function createListingCard(listing) {
  const {
    id,
    title = 'Untitled Property',
    type = 'PG',
    price = 0,
    location = '',
    city = 'Pune',
    images = [],
    amenities = [],
    category = '',
    foodIncluded = false,
    ac = false,
    bathroom = 'shared',
    verified = false,
    featured = false,
    viewsCount = 0
  } = listing;

  // Get primary image or fallback
  const primaryImage = images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop';

  // Build badge HTML
  const typeBadge = `<span class="badge-type">${escapeHtml(type)}</span>`;
  const verifiedBadge = verified
    ? `<span class="badge-verified"><i class="bi bi-check-circle-fill"></i> Verified</span>`
    : '';
  const featuredBadge = featured
    ? `<span class="badge-featured"><i class="bi bi-star-fill"></i> Featured</span>`
    : '';

  // Build amenity chips (max 3)
  const amenityIcons = {
    'WiFi': 'bi-wifi',
    'wifi': 'bi-wifi',
    'AC': 'bi-snow',
    'ac': 'bi-snow',
    'Meals': 'bi-egg-fried',
    'meals': 'bi-egg-fried',
    'Food': 'bi-egg-fried',
    'food': 'bi-egg-fried',
    'Attached Bath': 'bi-droplet',
    'attached bath': 'bi-droplet',
    'Attached Bathroom': 'bi-droplet',
    'TV': 'bi-tv',
    'tv': 'bi-tv',
    'Security': 'bi-shield-check',
    'security': 'bi-shield-check',
    'CCTV': 'bi-shield-check',
    'Parking': 'bi-car-front',
    'parking': 'bi-car-front',
    'Gym': 'bi-bicycle',
    'gym': 'bi-bicycle',
    'Laundry': 'bi-box',
    'laundry': 'bi-box',
    'Power Backup': 'bi-lightning',
    'power backup': 'bi-lightning',
    'RO Water': 'bi-water',
    'Geyser': 'bi-thermometer-half',
    'Housekeeping': 'bi-house-door',
    'Kitchen': 'bi-cup-hot'
  };

  // Auto-add Food/AC amenities if flags are true
  let displayAmenities = [...amenities];
  if (foodIncluded && !displayAmenities.some(a => a.toLowerCase().includes('food') || a.toLowerCase().includes('meal'))) {
    displayAmenities.unshift('Meals');
  }
  if (ac && !displayAmenities.some(a => a.toLowerCase() === 'ac')) {
    displayAmenities.unshift('AC');
  }

  const amenityChips = displayAmenities.slice(0, 3).map(amenity => {
    const icon = amenityIcons[amenity] || amenityIcons[amenity.toLowerCase()] || 'bi-check-circle';
    return `<span class="amenity-chip"><i class="bi ${icon}"></i> ${escapeHtml(amenity)}</span>`;
  }).join('');

  // Format price
  const formattedPrice = formatPrice(price);

  // Category badge
  const categoryDisplay = category
    ? `<span class="status-badge approved" style="font-size:0.65rem;padding:0.15rem 0.5rem;">${capitalize(category)}</span>`
    : '';

  return `
    <div class="col-xl-3 col-lg-4 col-md-6" data-listing-id="${id}">
      <div class="listing-card" onclick="window.location.href='detail.html?id=${id}'" style="cursor:pointer;">
        <div class="listing-card-image">
          <img src="${escapeHtml(primaryImage)}" 
               alt="${escapeHtml(title)}"
               loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop'">
          <div class="listing-card-badge">
            ${typeBadge}
            ${verifiedBadge}
            ${featuredBadge}
          </div>
          <button class="listing-card-wishlist" data-id="${id}" onclick="event.stopPropagation();">
            <i class="bi bi-heart"></i>
          </button>
        </div>
        <div class="listing-card-body">
          <h5 class="listing-card-title">${escapeHtml(title)}</h5>
          <p class="listing-card-location">
            <i class="bi bi-geo-alt-fill"></i> ${escapeHtml(location)}${city ? ', ' + escapeHtml(city) : ''}
          </p>
          <div class="listing-card-amenities">
            ${amenityChips}
          </div>
          <div class="listing-card-footer">
            <span class="listing-card-price">${formattedPrice}<span>/mo</span></span>
            <a href="detail.html?id=${id}" class="listing-card-cta" onclick="event.stopPropagation();">View Details</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// Filter & Search Logic
// ============================================
function setupEventListeners() {
  // Filter button
  if (filterBtn) {
    filterBtn.addEventListener('click', applyFilters);
  }

  // Search on Enter key
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFilters();
      }
    });
  }

  // Sort change
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  // Real-time filter for dropdowns
  [typeFilter, categoryFilter, priceFilter].forEach(el => {
    if (el) {
      el.addEventListener('change', applyFilters);
    }
  });
}

function applyFilters() {
  let results = [...allListings];

  // 1. Search text filter
  if (searchInput && searchInput.value.trim()) {
    const searchTerm = searchInput.value.trim().toLowerCase();
    results = results.filter(listing => {
      const searchable = `${listing.title} ${listing.location} ${listing.city} ${listing.type}`.toLowerCase();
      return searchable.includes(searchTerm);
    });
  }

  // 2. Type filter
  if (typeFilter && typeFilter.value && typeFilter.value !== 'All Types') {
    results = results.filter(listing =>
      listing.type && listing.type.toLowerCase() === typeFilter.value.toLowerCase()
    );
  }

  // 3. Category filter
  if (categoryFilter && categoryFilter.value && categoryFilter.value !== 'All') {
    results = results.filter(listing =>
      listing.category && listing.category.toLowerCase() === categoryFilter.value.toLowerCase()
    );
  }

  // 4. Price filter
  if (priceFilter && priceFilter.value && priceFilter.value !== 'Any Price') {
    results = results.filter(listing => {
      const price = listing.price || 0;
      switch (priceFilter.value) {
        case 'Under ₹5,000': return price < 5000;
        case '₹5,000 - ₹8,000': return price >= 5000 && price <= 8000;
        case '₹8,000 - ₹12,000': return price >= 8000 && price <= 12000;
        case '₹12,000 - ₹20,000': return price >= 12000 && price <= 20000;
        case 'Above ₹20,000': return price > 20000;
        default: return true;
      }
    });
  }

  // 5. AC filter
  if (acFilter && acFilter.checked) {
    results = results.filter(listing => listing.ac === true);
  }

  // 6. Food filter
  if (foodFilter && foodFilter.checked) {
    results = results.filter(listing => listing.foodIncluded === true);
  }

  // 7. Sort
  if (sortSelect) {
    switch (sortSelect.value) {
      case 'Price: Low to High':
        results.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'Price: High to Low':
        results.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'Newest First':
        results.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        break;
      case 'Rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Featured first, then by date
        results.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
    }
  }

  filteredListings = results;
  renderListings(filteredListings);
  updateResultsCount(filteredListings.length);

  // Toast feedback
  if (window.showToast) {
    window.showToast(`Found ${results.length} listing${results.length !== 1 ? 's' : ''}`, 'success');
  }
}

// ============================================
// UI State Functions
// ============================================
function showLoadingState() {
  if (!listingsGrid) return;

  const skeletons = Array(8).fill('').map(() => `
    <div class="col-xl-3 col-lg-4 col-md-6">
      <div class="listing-card">
        <div class="skeleton skeleton-image"></div>
        <div style="padding:1.2rem;">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
          <div class="skeleton skeleton-text medium" style="margin-top:1rem;"></div>
        </div>
      </div>
    </div>
  `).join('');

  listingsGrid.innerHTML = skeletons;
}

function showEmptyState() {
  if (!listingsGrid) return;

  listingsGrid.innerHTML = `
    <div class="col-12">
      <div class="empty-state">
        <i class="bi bi-building"></i>
        <h4>No Listings Available</h4>
        <p>There are no approved listings yet. Check back soon or list your own property!</p>
        <a href="add-listing.html" class="btn btn-accent">
          <i class="bi bi-plus-lg"></i> List Your Property
        </a>
      </div>
    </div>
  `;
  updateResultsCount(0);
}

function showNoResultsState() {
  if (!listingsGrid) return;

  listingsGrid.innerHTML = `
    <div class="col-12">
      <div class="empty-state">
        <i class="bi bi-search"></i>
        <h4>No Results Found</h4>
        <p>Try adjusting your filters or search with different keywords</p>
        <button class="btn btn-accent" onclick="location.reload()">
          <i class="bi bi-arrow-clockwise"></i> Reset Filters
        </button>
      </div>
    </div>
  `;
}

function showErrorState() {
  if (!listingsGrid) return;

  listingsGrid.innerHTML = `
    <div class="col-12">
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle"></i>
        <h4>Something Went Wrong</h4>
        <p>Failed to load listings. Please check your connection and try again.</p>
        <button class="btn btn-accent" onclick="location.reload()">
          <i class="bi bi-arrow-clockwise"></i> Try Again
        </button>
      </div>
    </div>
  `;
  updateResultsCount(0);
}

// ============================================
// Helper Functions
// ============================================
function updateResultsCount(count) {
  if (resultsCount) {
    resultsCount.innerHTML = `Showing <strong class="text-accent">${count}</strong> result${count !== 1 ? 's' : ''}`;
  }
}

function formatPrice(price) {
  if (!price || price === 0) return '₹0';
  return '₹' + Number(price).toLocaleString('en-IN');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function attachWishlistListeners() {
  document.querySelectorAll('.listing-card-wishlist').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
      const icon = this.querySelector('i');
      if (this.classList.contains('active')) {
        icon.classList.remove('bi-heart');
        icon.classList.add('bi-heart-fill');
        if (window.showToast) window.showToast('Added to wishlist!', 'success');
      } else {
        icon.classList.remove('bi-heart-fill');
        icon.classList.add('bi-heart');
        if (window.showToast) window.showToast('Removed from wishlist', 'warning');
      }
    });
  });
}

// Export for potential use by other modules
export { loadListings, applyFilters, allListings };