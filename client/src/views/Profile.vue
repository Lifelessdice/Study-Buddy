<template>
  <div class="container mt-4">
    <div class="card">
      <div class="card-body">
        <p class="text-uppercase small text-muted mb-1">Profile</p>
        <h3 class="mb-2">{{ displayName }}</h3>
        <div class="text-muted mb-3">{{ userEmail }}</div>

        <div class="profile-details">
          <div class="profile-row">
            <span class="profile-label">Role</span>
            <span class="profile-value text-capitalize">{{ userRole }}</span>
          </div>
          <div class="profile-row" v-if="userId">
            <span class="profile-label">User ID</span>
            <span class="profile-value">{{ userId }}</span>
          </div>
        </div>

        <div class="d-flex gap-2 flex-wrap mt-3">
          <BaseButton to="/dashboard" variant="primary" size="sm">Back to Dashboard</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      user: null
    }
  },
  computed: {
    displayName() {
      if (!this.user) return 'User'
      return this.user.name || this.user.email || 'User'
    },
    userEmail() {
      if (!this.user) return ''
      return this.user.email || 'No email on file'
    },
    userRole() {
      if (!this.user) return 'Unknown'
      return this.user.role || 'Unknown'
    },
    userId() {
      if (!this.user) return ''
      return this.user._id || ''
    }
  },
  mounted() {
    const u = localStorage.getItem('user')
    this.user = u ? JSON.parse(u) : null
    if (!this.user) {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.profile-details {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.profile-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
}

.profile-value {
  font-weight: 600;
}
</style>
