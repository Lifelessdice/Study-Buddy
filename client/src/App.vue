<template>
  <div id="app" class="app-shell">
    <!-- NAVBAR / UPPER THING -->
      <nav class="navbar navbar-light bg-light px-3 mb-3 app-header">
      <router-link class="navbar-brand" to="/">StudyBuddy</router-link>

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
          <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
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
          <router-link class="nav-link" to="/results">Results</router-link>
        </li>
        <li class="nav-item me-2" v-if="user && user.role === 'student'">
          <router-link class="nav-link" to="/notes">Lectures</router-link>
        </li>
      </div>

      <div class="d-flex align-items-center ms-auto" v-if="user">
        <span class="me-2 small text-muted user-info">
          {{ user.email }} ({{ user.role }})
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

/* Optional: make margins smaller on very short landscape screens */
@media (max-height: 500px) and (orientation: landscape) {
  .container.mt-4 {
    margin-top: 0.5rem !important;
    margin-bottom: 0.5rem !important;
  }

  .card {
    margin-bottom: 0.5rem !important;
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

</style>
