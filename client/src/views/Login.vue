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
          <label class="form-label">Password</label>
          <input v-model="password" class="form-control" type="password" required>
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
      password: ''
    }
  },
  methods: {
    async login() {
      try {
        const res = await api.post('/auth/login', {
          email: this.email,
          password: this.password
        })

        const { token, data } = res.data
        const user = data.user
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        this.$router.push('/dashboard')
      } catch (err) {
        alert(err.response?.data?.message || 'Login error')
      }
    }
  }
}
</script>
