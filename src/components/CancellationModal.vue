<template>
  <div class="modalOverlay" @click.self="$emit('close')">
    <div
      ref="modalContainer"
      class="modalContent"
      tabindex="-1"
      @keydown.esc="$emit('close')"
    >
      <form class="cancelForm" @submit.prevent="$emit('submit')">
        <p>
          Вы уверены, что хотите отменить запись
          {{ registration?.user.firstName }}
          {{ registration?.user.lastName }} на курс "{{
            registration?.course.title
          }}"?
        </p>

        <textarea
          :value="cancellationReason"
          placeholder="Причина отмены (необязательно)"
          class="cancelFormTextarea"
          @input="$emit('update:cancellationReason', $event.target.value)"
        />

        <div class="cancelFormActions">
          <button :disabled="isSubmitting" class="actionButton" type="submit">Да, отменить</button>
          <button :disabled="isSubmitting" class="actionButton" type="button" @click="$emit('close')">Нет</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  registration: {
    type: Object,
    default: null,
  },
  cancellationReason: {
    type: String,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['close', 'submit', 'update:cancellationReason'])

const modalContainer = ref(null)

watch(
  () => props.registration,
  async (registration) => {
    if (!registration) {
      return
    }

    await nextTick()
    modalContainer.value?.focus()
  },
  { immediate: true }
)
</script>

<style scoped>
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--color-overlay);
}

.modalContent {
  width: 400px;
  padding: 20px;
  background: var(--color-surface-primary);
}

.cancelForm {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cancelFormTextarea {
  width: 100%;
  padding: 8px;
  resize: none;
}

.cancelFormActions {
  display: flex;
  gap: 10px;
}

.actionButton {
  padding: 2px 5px;
}
</style>
