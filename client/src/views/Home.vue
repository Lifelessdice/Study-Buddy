<template>
  <div>
    <b-container fluid>
      <h1 class="display-5 fw-bold">DIT342 Frontend</h1>
      <p class="fs-4">Welcome to your DIT342 Frontend Vue.js App</p>

      <!-- Navigation -->
      <p>
        <router-link to="/login">Login</router-link> |
        <router-link to="/signup">Sign Up</router-link>
      </p>

      <b-button class="btn_message" variant="primary" @click="getMessage">
        Get Message from Server
      </b-button>

      <p class="col-xl-9">
        Message from the server:<br/>
        {{ message }}
      </p>
    </b-container>
  </div>
</template>

<script>
import Api from '@/Api'

export default {
  name: 'home',
  data() {
    return {
      message: 'none'
    }
  },
  methods: {
    getMessage() {
      Api.get('/health')
        .then(response => {
          this.message = response.data.status
        })
        .catch(error => {
          this.message = error
        })
    }
  }
}
</script>
