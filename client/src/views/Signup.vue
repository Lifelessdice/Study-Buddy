<template>
  <div class="container mt-5" style="max-width: 500px">
    <h2 class="mb-4 text-center">Sign Up</h2>

    <div class="card p-4 shadow-sm">
      <form @submit.prevent="signup">
        <div class="mb-3">
          <label class="form-label">Name (optional)</label>
          <input v-model="name" class="form-control" type="text">
        </div>

        <div class="mb-3">
          <label class="form-label">Email *</label>
          <input v-model="email" class="form-control" required type="email">
        </div>

        <div class="mb-3">
          <label class="form-label">Role *</label>
          <select v-model="role" class="form-select" required>
            <option value="">Select role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Password *</label>
          <input v-model="password" class="form-control" type="password" required minlength="6">
        </div>

        <button class="btn btn-primary w-100">Create Account</button>

        <p class="mt-3 text-center">
          Already have an account?
          <router-link to="/login">Log in</router-link>
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
      name: '',
      email: '',
      role: '',
      password: ''
    }
  },
  methods: {
    async signup() {
      try {
        const res = await api.post('/auth/register', {
          name: this.name,
          email: this.email,
          role: this.role,
          password: this.password
        })

        alert('Account created! You can now log in.')
        this.$router.push('/login')
      } catch (err) {
        alert(err.response?.data?.message || 'Error creating user')
      }
    }
  }
}
</script>
