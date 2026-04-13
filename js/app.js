// ============================================
// NESTIFY — App.js
// UI Interactions + Firebase Auth Navbar
// ============================================

// ---- Firebase Auth Navbar (runs as module separately) ----
(function initNavbarAuth() {
  const navAuth = document.getElementById('navAuth') || document.querySelector('.nav-auth-section');
  if (!navAuth) return;

  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
    import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

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

    // =============================================
    // PLATFORM SETTINGS LOADER
    // Yeh function har page pe settings apply karta hai
    // =============================================
    async function applyPlatformSettings(userRole) {
      try {
        const snap = await getDoc(doc(db, "settings", "platform_settings"));
        if (!snap.exists()) return;

        const s = snap.data();

        // Global access — dusre pages bhi use kar saken
        window.platformSettings = s;

        // --- 1. Platform Name ---
        if (s.platformName) {
          // Browser tab title update
          const brandEls = document.querySelectorAll('.navbar-brand-nestify');
          brandEls.forEach(el => {
            // Brand ke andar NEST<span>IFY</span> structure maintain karo
            const upper = s.platformName.toUpperCase();
            const half = Math.ceil(upper.length / 2);
            el.innerHTML =
              '<i class="bi bi-house-heart-fill"></i> ' +
              upper.slice(0, half) +
              '<span>' + upper.slice(half) + '</span>';
          });
        }

        // --- 2. Maintenance Mode ---
        // Admin ko nahi dikhana, baaki sab ko dikhana
        if (s.maintenanceMode && userRole !== 'admin') {
          // Admin settings page pe nahi dikhana
          const isAdminPage = window.location.pathname.includes('admin-');
          if (!isAdminPage) {
            document.body.innerHTML = \`
              <div style="
                display:flex;flex-direction:column;align-items:center;justify-content:center;
                height:100vh;background:#0f0f0f;color:#fff;text-align:center;padding:2rem;
              ">
                <i class="bi bi-tools" style="font-size:3rem;color:#ff6b00;margin-bottom:1rem;"></i>
                <h2 style="font-weight:700;">Site Under Maintenance</h2>
                <p style="color:#888;max-width:400px;margin-top:0.5rem;">
                  We're making some improvements. Please check back shortly.
                </p>
              </div>
            \`;
            // Bootstrap icons load karo maintenance page ke liye
            const iconLink = document.createElement('link');
            iconLink.rel = 'stylesheet';
            iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
            document.head.appendChild(iconLink);
            return; // Aage kuch mat karo
          }
        }

        // --- 3. Allow New Registrations ---
        // register.html pe signup form hide karo agar band hai
        if (s.allowRegistrations === false) {
          const registerForm = document.getElementById('registerForm');
          const signupSection = document.getElementById('signupSection');
          const target = registerForm || signupSection;
          if (target) {
            target.innerHTML = \`
              <div class="text-center py-4">
                <i class="bi bi-person-x" style="font-size:2.5rem;color:#ef4444;"></i>
                <h5 class="mt-3">Registrations Closed</h5>
                <p class="text-muted" style="font-size:0.9rem;">New account creation is temporarily disabled.</p>
                <a href="login.html" class="btn btn-accent btn-sm-custom mt-2">Go to Login</a>
              </div>
            \`;
          }
        }

        // --- 4. Allow New Listings ---
        // Add listing button aur form hide karo agar band hai
        if (s.allowNewListings === false) {
          // Navbar ya dashboard mein "Add Listing" buttons
          document.querySelectorAll(
            'a[href="add-listing.html"], button[onclick*="add-listing"]'
          ).forEach(btn => {
            btn.style.display = 'none';
          });

          // Agar user add-listing.html pe hi hai toh form disable karo
          if (window.location.pathname.includes('add-listing')) {
            const form = document.getElementById('addListingForm') || document.querySelector('form');
            if (form) {
              form.innerHTML = \`
                <div class="text-center py-5">
                  <i class="bi bi-building-slash" style="font-size:2.5rem;color:#eab308;"></i>
                  <h5 class="mt-3">Listing Submissions Paused</h5>
                  <p class="text-muted" style="font-size:0.9rem;">
                    New property listings are temporarily not being accepted.
                  </p>
                </div>
              \`;
            }
          }
        }

        // --- 5. Platform Tagline ---
        if (s.platformTagline) {
          const taglineEl = document.getElementById('platformTagline')
            || document.querySelector('.hero-tagline')
            || document.querySelector('.hero-subtitle');
          if (taglineEl) taglineEl.textContent = s.platformTagline;
        }

        // --- 6. Reviews disable ---
        if (s.enableReviews === false) {
          const reviewSection = document.getElementById('reviewsSection')
            || document.querySelector('.reviews-section');
          if (reviewSection) reviewSection.style.display = 'none';

          const writeReviewBtn = document.getElementById('writeReviewBtn')
            || document.querySelector('[data-action="write-review"]');
          if (writeReviewBtn) writeReviewBtn.style.display = 'none';
        }

      } catch(e) {
        // Settings load fail — silently ignore, defaults apply rehenge
        console.warn('Nestify: Could not load platform settings.', e.message);
      }
    }

    // =============================================
    // AUTH STATE
    // =============================================
    onAuthStateChanged(auth, async (user) => {
      const navAuth = document.getElementById('navAuth') || document.querySelector('.nav-auth-section');

      let role = 'guest';

      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) role = snap.data().role || 'user';
        } catch(e) {}

        // Settings apply karo role ke saath
        await applyPlatformSettings(role);

        if (!navAuth) return;

        const dashboardLink = role === 'admin'
          ? 'admin-dashboard.html'
          : role === 'client'
          ? 'client-dashboard.html'
          : 'index.html';

        const name = user.displayName ? user.displayName.split(' ')[0] : 'User';
        const photo = user.photoURL
          ? user.photoURL
          : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'U') + '&background=ff6b00&color=fff';

        navAuth.innerHTML = \`
          <span class="text-muted-custom fs-sm d-none d-md-inline me-2">Hi, \${name}</span>
          <div class="dropdown">
            <img src="\${photo}"
                 class="nav-user-avatar dropdown-toggle"
                 data-bs-toggle="dropdown"
                 alt="\${name}"
                 onerror="this.src='https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&background=ff6b00&color=fff'">
            <ul class="dropdown-menu dropdown-menu-end" style="background:var(--bg-card);border-color:var(--border-color);min-width:180px;">
              <li>
                <a class="dropdown-item text-light" href="\${dashboardLink}">
                  <i class="bi bi-speedometer2 me-2 text-accent"></i>Dashboard
                </a>
              </li>
              <li><hr class="dropdown-divider" style="border-color:var(--border-color);"></li>
              <li>
                <a class="dropdown-item text-danger" href="#" id="navLogoutBtn">
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </a>
              </li>
            </ul>
          </div>
        \`;

        document.getElementById('navLogoutBtn').addEventListener('click', (e) => {
          e.preventDefault();
          signOut(auth).then(() => { window.location.href = 'login.html'; });
        });

      } else {
        // Guest user — settings apply karo bina role ke
        await applyPlatformSettings('guest');

        if (!navAuth) return;
        navAuth.innerHTML = \`
          <a href="login.html" class="btn btn-accent btn-sm-custom">
            <i class="bi bi-box-arrow-in-right"></i> Login
          </a>
        \`;
      }
    });
  `;
  document.head.appendChild(script);
})();


// ---- All other UI interactions ----
document.addEventListener('DOMContentLoaded', function () {

  // ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('mainNavbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ---- Wishlist Toggle ----
  document.querySelectorAll('.listing-card-wishlist').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
      const icon = this.querySelector('i');
      if (this.classList.contains('active')) {
        icon.classList.replace('bi-heart', 'bi-heart-fill');
        showToast('Added to wishlist!', 'success');
      } else {
        icon.classList.replace('bi-heart-fill', 'bi-heart');
        showToast('Removed from wishlist', 'warning');
      }
    });
  });

  // ---- Toast Notification System ----
  function showToast(message, type = 'success') {
    document.querySelectorAll('.toast-nestify').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast-nestify ${type}`;

    const iconMap = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-circle-fill'
    };
    const colorMap = {
      success: 'var(--success)',
      error: 'var(--danger)',
      warning: 'var(--warning)'
    };

    toast.innerHTML = `
      <i class="bi ${iconMap[type]}" style="font-size:1.2rem;color:${colorMap[type]};"></i>
      <span style="font-size:0.9rem;">${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  window.showToast = showToast;

  // ---- Counter Animation ----
  function animateCounters() {
    document.querySelectorAll('.hero-stat-item h3').forEach(el => {
      const text = el.textContent;
      const num = parseInt(text.replace(/[^0-9]/g, ''));
      const suffix = text.replace(/[0-9,]/g, '');
      if (isNaN(num)) return;

      let current = 0;
      const increment = Math.ceil(num / 60);
      const timer = setInterval(() => {
        current += increment;
        if (current >= num) { current = num; clearInterval(timer); }
        el.textContent = current.toLocaleString() + suffix;
      }, 25);
    });
  }

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(heroStats);
  }

  // ---- Admin Toggle Feedback ----
  document.querySelectorAll('.form-check-input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', function () {
      if (this.closest('.form-check-dark')) return;
      showToast(`Toggle ${this.checked ? 'Enabled' : 'Disabled'}`, 'success');
    });
  });

  console.log('%c🏠 Nestify — PG & Room Finder', 'color: #ff6b00; font-size: 20px; font-weight: bold;');
});
