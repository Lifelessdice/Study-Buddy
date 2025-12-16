<template>
  <div id="app" class="app-shell">
    <!-- NAVBAR / UPPER THING -->
      <nav class="navbar navbar-light bg-light px-3 mb-3 app-header">
      <router-link class="navbar-brand app-brand" to="/">
        StudyBuddy
      </router-link>


      <!-- NO 'collapse' class, NO expand-lg -->
      <div class="navbar-nav flex-row flex-wrap me-auto ms-3">
        <li class="nav-item me-2" v-if="!user">
          <router-link class="nav-link" to="/login">
            <span class="nav-text">Login</span>
            <span class="nav-icon">🔐</span>
          </router-link>

        </li>
        <li class="nav-item me-2" v-if="!user">
          <router-link class="nav-link" to="/signup">Sign Up</router-link>
        </li>
        <li class="nav-item me-2" v-if="user">
          <router-link class="nav-link" to="/dashboard">
            <span class="nav-text">Dashboard</span>
            <span class="nav-icon">📊</span>
          </router-link>
        </li>
        <li class="nav-item me-2" v-if="user && (user.role === 'teacher' || user.role === 'student')">
          <router-link class="nav-link" to="/courses">
            <span class="nav-text">
              {{ user.role === 'teacher' ? 'Courses' : 'My Courses' }}
            </span>
            <span class="nav-icon">📚</span>
          </router-link>
        </li>
        <li class="nav-item me-2" v-if="user && user.role === 'student'">
          <router-link class="nav-link" to="/results">
            <span class="nav-text">Results</span>
            <span class="nav-icon">🧪</span>
          </router-link>
        </li>
        <li class="nav-item me-2" v-if="user && user.role === 'student'">
          <router-link class="nav-link" to="/notes">
            <span class="nav-text">Lectures</span>
            <span class="nav-icon">🎓</span>
          </router-link>
        </li>
      </div>

      <div class="d-flex align-items-center ms-auto user-actions" v-if="user">
        <span class="me-2 small text-muted user-info">
          {{ displayName }}
        </span>
        <BaseButton variant="danger" outline size="sm" @click="logout">
          <span class="nav-text">Logout</span>
          <span class="nav-icon">🚪</span>
        </BaseButton>

      </div>
    </nav>

    <!-- MAIN SCROLLABLE AREA -->
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'AppShell',
  data() {
    return {
      user: null
    }
  },
  created() {
    this.loadUser()
  },
  watch: {
    '$route'() {
      this.loadUser()
    }
  },
  methods: {
    loadUser() {
      const u = localStorage.getItem('user')
      this.user = u ? JSON.parse(u) : null
    },
    logout() {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      this.user = null
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

/* =========================
   Responsive Navbar (Mobile)
   ========================= */

/* Icons hidden by default (desktop) */
.nav-icon {
  display: none;
  font-size: 1.2rem;
}

/* Mobile breakpoint */
@media (max-width: 576px) {
  /* Hide text, show icons */
  .nav-text {
    display: none;
  }

  .nav-icon {
    display: inline;
  }

  /* Hide email + role */
  .user-info {
    display: none;
  }

  /* Tighten navbar spacing */
  .nav-link {
    padding: 0.4rem 0.55rem;
  }

  /* Make icon buttons feel balanced */
  .btn {
    padding: 0.35rem 0.55rem;
  }
}

@media (max-width: 380px) {
  .btn .nav-text {
    display: none;
  }

  .btn .nav-icon {
    display: inline;
  }

  .btn {
    padding: 0.35rem 0.45rem;
  }
}

.user-actions {
  flex-wrap: nowrap;
  white-space: nowrap;
}

@media (max-width: 576px) {
  .app-brand {
    display: none;
  }
}


</style>
