<template>
  <div class="container mt-5" style="max-width: 500px">
    <h2 class="mb-4 text-center">Log In</h2>

    <div class="card p-4 shadow-sm">
      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" class="form-control" required type="email">
        </div>

        <div class="mb-3">
          <label class="form-label">Role</label>
          <select v-model="role" class="form-select" required>
            <option value="">Select role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <button class="btn btn-success w-100">Log In</button>

        <p class="mt-3 text-center">
          Don't have an account?
          <router-link to="/signup">Sign up</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../Api'

export default {
  data() {
    return {
      email: '',
      role: ''
    }
  },
  methods: {
    async login() {
      try {
        const res = await api.get('/users')
        const users = res.data.data

        const match = users.find(
          u => u.email === this.email && u.role === this.role
        )

        if (!match) {
          alert('Invalid email or role')
          return
        }

        // Save user to localStorage
        localStorage.setItem('user', JSON.stringify(match))

        this.$router.push('/dashboard')
      } catch (err) {
        alert('Login error')
      }
    }
  }
}
</script>
