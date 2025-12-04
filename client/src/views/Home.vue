<template>
  <div class="home-hero d-flex align-items-center">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-7">
          <div class="hero-card shadow-sm">
            <p class="text-uppercase small text-muted mb-2">StudyBuddy</p>
            <h1 class="fw-bold mb-3">Welcome back</h1>
            <p class="text-muted mb-4">
              Focus on learning. Sign in to pick up where you left off or create an account to get started.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <router-link class="btn btn-primary" to="/login">Login</router-link>
              <router-link class="btn btn-outline-secondary" to="/signup">Sign Up</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home'
}
</script>

<style scoped>
.home-hero {
  min-height: 80vh;
  background: linear-gradient(135deg, #eef2ff 0%, #f8f9ff 60%, #ffffff 100%);
}

.hero-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
}

@media (max-width: 576px) {
  .hero-card {
    padding: 24px;
  }
}
</style>
