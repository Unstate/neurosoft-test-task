<template>
  <div class="container">
    <CourseRegistrations :course-id="1" />
  </div>
</template>

<script setup>
import CourseRegistrations from "./components/CourseRegistrations.vue";
</script>


<style lang="css" scoped>
.container {
    max-width: 700px;
    margin: 40px auto;
    font-family: sans-serif;
    padding: 20px;
}
</style>
