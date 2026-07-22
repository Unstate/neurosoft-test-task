<template>
  <div class="filters">
    <input
      :value="searchQuery"
      placeholder="Поиск..."
      class="filtersInput"
      @input="$emit('update:search-query', $event.target.value)"
    />
    <select
      :value="selectedStatus"
      class="filtersSelect"
      @change="$emit('update:selected-status', $event.target.value)"
    >
      <option value="">Все</option>
      <option value="active">Активные</option>
      <option value="completed">Завершенные</option>
      <option value="cancelled">Отмененные</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
  selectedStatus: {
    type: String,
    required: true,
  },
})

defineEmits(['update:search-query', 'update:selected-status'])
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.filtersInput,
.filtersSelect {
  width: 200px;
  padding: 10px;
}
</style>
