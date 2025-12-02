<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light px-3 mb-3">
      <router-link class="navbar-brand" to="/">StudyBuddy</router-link>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item" v-if="!user">
            <router-link class="nav-link" to="/login">Login</router-link>
          </li>
          <li class="nav-item" v-if="!user">
            <router-link class="nav-link" to="/signup">Sign Up</router-link>
          </li>
          <li class="nav-item" v-if="user">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
          <li class="nav-item" v-if="user && (user.role === 'teacher' || user.role === 'student')">
            <router-link class="nav-link" to="/courses">
              {{ user.role === 'teacher' ? 'Courses' : 'My Courses' }}
            </router-link>
          </li>
        </ul>
        <div class="d-flex align-items-center" v-if="user">
          <span class="me-2 small text-muted">{{ user.email }} ({{ user.role }})</span>
          <button class="btn btn-outline-danger btn-sm" @click="logout">Logout</button>
        </div>
      </div>
    </nav>

    <router-view/>
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
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  margin: 0;
}
</style>
