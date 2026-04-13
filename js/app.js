// ============================================
// NESTIFY — App.js
// UI Interactions + Firebase Auth Navbar
// ============================================

// ---- Firebase Auth Navbar (runs as module separately) ----
// We use a dynamic import so this non-module script can still work
(function initNavbarAuth() {
  // Only run on pages that have the nav-auth-section
  const navAuth = document.getElementById('navAuth') || document.querySelector('.nav-auth-section');
  if (!navAuth) return;

  // Dynamically load Firebase auth state
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

    onAuthStateChanged(auth, async (user) => {
      // Find nav auth section — could be #navAuth or .nav-auth-section
      const navAuth = document.getElementById('navAuth') || document.querySelector('.nav-auth-section');
      if (!navAuth) return;

      if (user) {
        // Logged in — get role from Firestore
        let role = 'user';
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) role = snap.data().role || 'user';
        } catch(e) {}

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

        // Logout handler
        document.getElementById('navLogoutBtn').addEventListener('click', (e) => {
          e.preventDefault();
          signOut(auth).then(() => {
            window.location.href = 'login.html';
          });
        });

      } else {
        // Not logged in — show Login button
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

  // NOTE: Amenity toggles, image upload, and form submit
  // are handled in each page's own module script (add-listing.html, edit-listing.html)
  // to avoid conflicts with Firebase module code.

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