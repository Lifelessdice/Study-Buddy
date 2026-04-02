<template>
  <div class="nav-tabs-custom mb-3">
    <span
      class="tab"
      :class="{ active: currentTab === 'overview' }"
      @click="$emit('change-tab', 'overview')"
    >
      Overview
    </span>

    <span
      class="tab"
      :class="{ active: currentTab === 'notes' }"
      @click="$emit('change-tab', 'notes')"
    >
      Lectures
    </span>

    <span
      class="tab"
      :class="{ active: currentTab === 'quizzes' }"
      @click="$emit('change-tab', 'quizzes')"
    >
      Quizzes
    </span>

    <span
      class="tab"
      :class="{ active: currentTab === 'students' }"
      @click="$emit('change-tab', 'students')"
    >
      Students
    </span>
  </div>
</template>

<script>
export default {
  name: 'CourseTabs',
  props: {
    currentTab: String
  }
}
</script>
