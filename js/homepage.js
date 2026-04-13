// ============================================
// NESTIFY — Homepage (index.html)
// Fetches featured listings for homepage display
// ============================================

import { getFeaturedListings, getApprovedListings } from './firebase-config.js';

// ---- DOM Elements ----
const featuredGrid = document.getElementById('featuredGrid');

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🏠 Homepage initializing...');
  await loadFeaturedListings();
});

// ============================================
// Load Featured Listings
// ============================================
async function loadFeaturedListings() {
  if (!featuredGrid) return;

  // Show loading
  showFeaturedLoading();

  try {
    // Try featured first
    let listings = await getFeaturedListings(4);

    // If no featured, get latest approved
    if (listings.length === 0) {
      console.log('📋 No featured listings, loading latest approved...');
      listings = await getApprovedListings(4);
    }

    if (listings.length === 0) {
      showFeaturedEmpty();
      return;
    }

    renderFeaturedListings(listings);

  } catch (error) {
    console.error("❌ Failed to load featured listings:", error);
    showFeaturedEmpty();
  }
}

// ============================================
// Render Featured Listings
// ============================================
function renderFeaturedListings(listings) {
  if (!featuredGrid) return;

  featuredGrid.innerHTML = listings.map(listing => {
    const {
      id,
      title = 'Untitled Property',
      type = 'PG',
      price = 0,
      location = '',
      city = 'Pune',
      images = [],
      amenities = [],
      foodIncluded = false,
      ac = false,
      verified = false,
      featured = false
    } = listing;

    const primaryImage = images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop';

    const typeBadge = `<span class="badge-type">${escapeHtml(type)}</span>`;
    const verifiedBadge = verified
      ? `<span class="badge-verified"><i class="bi bi-check-circle-fill"></i> Verified</span>`
      : '';
    const featuredBadge = featured
      ? `<span class="badge-featured"><i class="bi bi-star-fill"></i> Featured</span>`
      : '';

    // Amenity icons mapping
    const amenityIcons = {
      'wifi': 'bi-wifi', 'ac': 'bi-snow', 'meals': 'bi-egg-fried',
      'food': 'bi-egg-fried', 'attached bath': 'bi-droplet',
      'tv': 'bi-tv', 'security': 'bi-shield-check', 'parking': 'bi-car-front',
      'gym': 'bi-bicycle', 'laundry': 'bi-box'
    };

    let displayAmenities = [...amenities];
    if (foodIncluded && !displayAmenities.some(a => a.toLowerCase().includes('food') || a.toLowerCase().includes('meal'))) {
      displayAmenities.unshift('Meals');
    }
    if (ac && !displayAmenities.some(a => a.toLowerCase() === 'ac')) {
      displayAmenities.unshift('AC');
    }

    const amenityChips = displayAmenities.slice(0, 3).map(amenity => {
      const icon = amenityIcons[amenity.toLowerCase()] || 'bi-check-circle';
      return `<span class="amenity-chip"><i class="bi ${icon}"></i> ${escapeHtml(amenity)}</span>`;
    }).join('');

    const formattedPrice = '₹' + Number(price).toLocaleString('en-IN');

    return `
      <div class="col-xl-3 col-lg-4 col-md-6">
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
  }).join('');

  // Re-attach wishlist listeners
  featuredGrid.querySelectorAll('.listing-card-wishlist').forEach(btn => {
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

// ============================================
// Loading & Empty States
// ============================================
function showFeaturedLoading() {
  if (!featuredGrid) return;

  featuredGrid.innerHTML = Array(4).fill('').map(() => `
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
}

function showFeaturedEmpty() {
  if (!featuredGrid) return;

  featuredGrid.innerHTML = `
    <div class="col-12">
      <div class="empty-state" style="padding:2rem;">
        <i class="bi bi-building" style="font-size:2.5rem;"></i>
        <h4>No Listings Yet</h4>
        <p>Be the first to list your property on Nestify!</p>
        <a href="add-listing.html" class="btn btn-accent">
          <i class="bi bi-plus-lg"></i> List Your Property
        </a>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

export { loadFeaturedListings };