<template>
  <div id="app" class="app-shell">
    <!-- NAVBAR / UPPER THING -->
    <nav class="navbar navbar-light bg-light px-3 mb-3 app-header">
      <div class="app-left">
        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="isMenuOpen ? 'true' : 'false'"
          aria-controls="app-menu"
          aria-label="Toggle menu"
          @click="toggleMenu"
        >
          <span class="menu-bar"></span>
          <span class="menu-bar"></span>
          <span class="menu-bar"></span>
        </button>
        <router-link class="navbar-brand app-brand" to="/">
          <img class="app-logo" :src="logoUrl" alt="StudyBuddy logo" />
          <span class="app-brand-text">StudyBuddy</span>
        </router-link>
      </div>
      <div class="app-center">
        <div class="navbar-nav flex-row flex-wrap app-nav">
          <li class="nav-item me-2" v-if="user">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
          <li class="nav-item me-2" v-if="user && (user.role === 'teacher' || user.role === 'student')">
            <router-link class="nav-link" to="/courses">
              {{ user.role === 'teacher' ? 'Courses' : 'My Courses' }}
            </router-link>
          </li>
          <li class="nav-item me-2" v-if="user && user.role === 'student'">
            <router-link class="nav-link" to="/results">Results</router-link>
          </li>
          <li class="nav-item me-2" v-if="user && user.role === 'student'">
            <router-link class="nav-link" to="/notes">Lectures</router-link>
          </li>
        </div>
      </div>
      <div class="app-right">
        <div class="d-flex align-items-center user-actions" v-if="user">
          <router-link class="me-2 small text-muted user-info user-profile-link" to="/profile">
            {{ displayName }}
          </router-link>
          <BaseButton variant="danger" outline size="sm" class="logout-btn" @click="logout">
            Logout
          </BaseButton>
        </div>
      </div>
    </nav>

    <div class="menu-backdrop" :class="{ open: isMenuOpen }" @click="closeMenu"></div>
    <aside id="app-menu" class="menu-panel" :class="{ open: isMenuOpen }">
      <div class="menu-header">
        <span class="menu-title">Menu</span>
        <button class="menu-close" type="button" aria-label="Close menu" @click="closeMenu">
          X
        </button>
      </div>
      <div v-if="user" class="menu-user">
        <span class="menu-user-label">Signed in as</span>
        <router-link class="menu-user-name" to="/profile" @click="closeMenu">
          {{ displayName }}
        </router-link>
      </div>
      <ul class="menu-list">
        <li v-if="user">
          <router-link class="menu-link" to="/dashboard" @click="closeMenu">Dashboard</router-link>
        </li>
        <li v-if="user && (user.role === 'teacher' || user.role === 'student')">
          <router-link class="menu-link" to="/courses" @click="closeMenu">
            {{ user.role === 'teacher' ? 'Courses' : 'My Courses' }}
          </router-link>
        </li>
        <li v-if="user && user.role === 'student'">
          <router-link class="menu-link" to="/results" @click="closeMenu">Results</router-link>
        </li>
        <li v-if="user && user.role === 'student'">
          <router-link class="menu-link" to="/notes" @click="closeMenu">Lectures</router-link>
        </li>
        <li v-if="user">
          <router-link class="menu-link" to="/profile" @click="closeMenu">Profile</router-link>
        </li>
        <li v-if="user">
          <BaseButton variant="danger" outline size="sm" class="menu-logout" @click="logout">
            <span class="menu-logout-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path d="M12 3v9"></path>
                <path d="M7.05 7.05a7 7 0 1 0 9.9 0"></path>
              </svg>
            </span>
            <span class="menu-logout-text">Sign out</span>
          </BaseButton>
        </li>
      </ul>
    </aside>
    <!-- MAIN SCROLLABLE AREA -->
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import logoUrl from './assets/studybuddy-logo.png'

export default {
  name: 'AppShell',
  data() {
    return {
      user: null,
      isMenuOpen: false,
      logoUrl
    }
  },
  created() {
    this.loadUser()
  },
  watch: {
    '$route'() {
      this.loadUser()
      this.closeMenu()
    }
  },
  methods: {
    loadUser() {
      const u = localStorage.getItem('user')
      this.user = u ? JSON.parse(u) : null
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenu() {
      this.isMenuOpen = false
    },
    logout() {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      this.user = null
      this.closeMenu()
      this.$router.push({ name: 'Login' })
    }
  },
  computed: {
  displayName() {
    if (!this.user) return ''
    const name = this.user.name || this.user.email?.split('@')[0] || 'User'
    const roleIcon = this.user.role === 'teacher' ? '👩‍🏫' : '🎓'
    return `${name} ${roleIcon}`
  }
} 
}
</script>

<style>
/* GLOBAL LAYOUT */
html,
body,
#app {
  height: 100%;
  margin: 0;
}

/* Root */
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  text-align: left; /* lets Bootstrap containers look normal */
}

/* Flex layout: navbar + main content */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar stays at top, content scrolls under it */
.app-header {
  position: sticky;  /* if you don't want sticky, change to `static` */
  top: 0;
  z-index: 1030;     /* above cards etc. */
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.menu-toggle {
  border: 1px solid #d0d6dc;
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.45rem 0.55rem;
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
}

.menu-toggle:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

.menu-bar {
  width: 1.5rem;
  height: 2px;
  background: #2c3e50;
  border-radius: 999px;
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1040;
}

.menu-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

.menu-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(85vw, 320px);
  background: #ffffff;
  box-shadow: -12px 0 30px rgba(0, 0, 0, 0.12);
  transform: translateX(100%);
  transition: transform 0.25s ease;
  z-index: 1045;
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-panel.open {
  transform: translateX(0);
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-title {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.menu-close {
  border: 1px solid #d0d6dc;
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.menu-user {
  background: #f3f5f7;
  border-radius: 0.75rem;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-user-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.menu-user-name {
  font-weight: 600;
  text-decoration: none;
  color: #2c3e50;
}

.menu-user-name:hover {
  color: #0d6efd;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-link {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 600;
  padding: 0.35rem 0;
}

.menu-link:hover {
  color: #0d6efd;
}

.menu-logout {
  width: 100%;
  justify-content: flex-start;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.75rem;
  border-color: #f3c6c6;
  color: #3f3f46;
  background: #fff;
  text-transform: none;
}

.menu-logout:hover {
  background: #fff1f2;
  border-color: #fda4af;
  color: #3f3f46;
}

.menu-logout-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  color: #e11d48;
}

.menu-logout-icon svg {
  width: 1.1rem;
  height: 1.1rem;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 992px) {
  .app-nav,
  .user-actions {
    display: none !important;
  }

  .menu-toggle {
    display: inline-flex;
  }
}

@media (min-width: 993px) {
  .menu-backdrop,
  .menu-panel {
    display: none;
  }
}

/* Router-view area */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Just in case */
body {
  margin: 0;
}

@media (max-height: 500px) and (orientation: landscape) {
  .container.mt-4 {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }

  .card {
    margin-bottom: 0.5rem !important;
  }
}

@media (max-width: 768px) {
  .user-info {
    display: none;
  }
}

.user-actions {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.app-nav {
  justify-content: center;
  gap: 1.25rem;
}

.app-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1 1 0;
}

.app-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
}

.app-logo {
  width: 36px;
  height: 36px;
  display: block;
  object-fit: contain;
}

.app-brand-text {
  letter-spacing: 0.01em;
}

.app-center {
  display: flex;
  justify-content: center;
  flex: 0 0 auto;
}

.app-right {
  display: flex;
  justify-content: flex-end;
  flex: 1 1 0;
}

.user-profile-link {
  text-decoration: none;
  color: inherit;
  font-weight: 600;
}

.user-profile-link:hover {
  color: #0d6efd;
}

@media (max-width: 576px) {
  .logout-btn {
    padding: 0.25rem 0.6rem;
    font-size: 0.8rem;
  }
}

/* Responsive tabs */
.responsive-tabs {
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.responsive-tabs .nav-link {
  white-space: nowrap;
}

@media (max-width: 576px) {
  .responsive-tabs {
    padding-bottom: 0.25rem;
  }

  .responsive-tabs .nav-link {
    padding: 0.4rem 0.75rem;
  }
}

/* Responsive stacked tables */
@media (max-width: 640px) {
  .table-responsive-stack thead {
    display: none;
  }

  .table-responsive-stack tbody tr {
    display: block;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    background: #fff;
  }

  .table-responsive-stack tbody td {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.35rem 0;
    border: none;
  }

  .table-responsive-stack tbody td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #6b7280;
    padding-right: 0.75rem;
  }

  .table-responsive-stack tbody td:last-child {
    padding-bottom: 0;
  }
}


</style>
