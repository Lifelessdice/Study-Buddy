<template>
  <div class="container mt-5">
    <h2>Welcome!</h2>
    <p>This is your dashboard.</p>

    <div v-if="user">
      <p><strong>Logged in as:</strong> {{ user.email }} ({{ user.role }})</p>

      <div v-if="user.role === 'teacher'">
        <router-link to="/courses" class="btn btn-primary">
          Manage Courses
        </router-link>
      </div>

      <div v-if="user.role === 'student'" class="mt-3">
        <router-link to="/courses/signup" class="btn btn-success">
          Sign Up for Courses
        </router-link>
      </div>
    </div>

    <button class="btn btn-danger mt-3" @click="logout">Log Out</button>
  </div>
</template>


<script>
export default {
  data() {
    return {
      user: null
    }
  },
  mounted() {
    const u = localStorage.getItem('user')
    this.user = u ? JSON.parse(u) : null
    if (!this.user) {
      this.$router.push('/login')
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      this.$router.push('/login')
    }
  }
}
</script>
