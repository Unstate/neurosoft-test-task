<template>
  <div class="registrationCard">
    <div class="registrationCardHeader">
      <b>{{ registration.user.lastName }} {{ registration.user.firstName }}</b>
      <span :class="registration.status">● </span>
    </div>
    <div>{{ registration.user.email }}</div>
    <div>Курс: {{ registration.course.title }}</div>
    <div>
      Дата записи:
      {{ formattedRegistrationDate }}
    </div>
    <div v-if="registration.status !== 'cancelled'" class="registrationCardActions">
      <button
        type="button"
        class="actionButton"
        @click="$emit('cancel', registration)"
      >
        Отменить запись
      </button>
    </div>
    <div v-else class="registrationCardStatus">
      Запись отменена
      <span v-if="registration.cancelReason" class="registrationCardReason">
        (причина: {{ registration.cancelReason }})
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  registration: {
    type: Object,
    required: true,
  },
})

defineEmits(['cancel'])

const formattedRegistrationDate = computed(() => {
  const { registeredAt } = props.registration

  if (typeof registeredAt !== 'string' || !registeredAt.trim()) {
    return 'Дата недоступна'
  }

  return registeredAt.split(' ').slice(0, 2).join(' ')
})
</script>

<style scoped>
.registrationCard {
  border: 1px solid var(--color-border-default);
  margin-bottom: 10px;
  padding: 20px 20px 20px 25px;
}

.registrationCardHeader {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
}

.registrationCardHeader .active {
  color: var(--color-status-active);
}

.registrationCardHeader .completed {
  color: var(--color-status-completed);
}

.registrationCardHeader .cancelled {
  color: var(--color-status-cancelled);
}

.registrationCardActions {
  margin-top: 15px;
}

.registrationCardStatus {
  margin-top: 15px;
  color: var(--color-status-cancelled);
  font-size: 12px;
  word-wrap: break-word;
}

.actionButton {
  padding: 2px 5px;
}
</style>
