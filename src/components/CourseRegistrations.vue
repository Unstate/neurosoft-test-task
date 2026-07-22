<template>
  <div>
    <h2>Записи на курсы</h2>
    <div v-if="isLoading">Загрузка...</div>
    <div v-else>
      <div class="filters">
        <input
          v-model="searchQuery"
          placeholder="Поиск..."
          class="filtersInput"
        />
        <select
          v-model="selectedStatus"
          class="filtersSelect"
        >
          <option value="">Все</option>
          <option value="active">Активные</option>
          <option value="completed">Завершенные</option>
          <option value="cancelled">Отмененные</option>
        </select>
      </div>

      <div v-if="isRegistrationsEmpty">Записей пока нет</div>
      <div v-else-if="isFilteredRegistrationsEmpty">Ничего не найдено</div>
      <div
        v-else
        v-for="registration in filteredRegistrations"
        :key="registration.id"
        class="registrationCard"
      >
        <div class="registrationCardHeader">
          <b>{{ registration.user.lastName }} {{ registration.user.firstName }}</b>
          <span :class="registration.status">● </span>
        </div>
        <div>{{ registration.user.email }}</div>
        <div>Курс: {{ registration.course.title }}</div>
        <div>
          Дата записи:
          {{ formatRegistrationDate(registration.registeredAt) }}
        </div>
        <div class="registrationCardActions" v-if="registration.status !== 'cancelled'">
          <button
            @click="openCancelModal(registration)"
            type="button"
            class="actionButton"
          >
            Отменить запись
          </button>
        </div>
        <div
          v-else
          class="registrationCardStatus"
        >
          Запись отменена
          <span
          v-if="registration.cancelReason"
          class="registrationCardReason">
            (причина: {{ registration.cancelReason }})
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="isCancelModalOpen"
      class="modalOverlay"
      @click.self="closeCancelModal"
    >
      <div
        ref="cancelModalContainer"
        class="modalContent"
        tabindex="-1"
        @keydown.esc="closeCancelModal"
      >
        <form
          class="cancelForm"
          @submit.prevent="submitCancellation"
        >
          <p>
            Вы уверены, что хотите отменить запись
            {{ selectedRegistration?.user.firstName }}
            {{ selectedRegistration?.user.lastName }} на курс "{{
              selectedRegistration?.course.title
            }}"?
          </p>

          <textarea
            v-model="cancellationReason"
            placeholder="Причина отмены (необязательно)"
            class="cancelFormTextarea"
          />

          <div class="cancelFormActions">
            <button :disabled="isSubmittingCancellation" class="actionButton" type="submit">Да, отменить</button>
            <button :disabled="isSubmittingCancellation" class="actionButton" type="button" @click="closeCancelModal">Нет</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="errorMessage" class="errorMessage">{{ errorMessage }}</div>
  </div>
</template>
<script setup>
import axios from 'axios';
import { computed, onMounted, nextTick, ref } from 'vue';
import { useDebouncedValue } from '../composables/useDebouncedValue';
import { API_ROUTES } from '../constants/apiRoutes';

const props = defineProps({
  courseId: {
    type: Number,
    required: true,
  }
})

const registrations = ref([]);
const isLoading = ref(false);
const errorMessage = ref(null);
const searchQuery = ref("");
const debouncedSearchQuery = useDebouncedValue(searchQuery)
const selectedStatus = ref("");
const isCancelModalOpen = ref(false);
const cancellationReason = ref('')
const cancelModalContainer = ref(null)
const selectedRegistration = ref(null);
const isSubmittingCancellation = ref(false);

const parseApiResponse = (response, fallbackMessage) => {
  if (!response?.data?.success) {
    throw new Error(response?.data?.message || fallbackMessage)
  }

  return response.data.data
}

const fetchRegistrations = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const response = await axios.get(`${API_ROUTES.REGISTRATION}?courseId=${props.courseId}`)
    const registrationsData = parseApiResponse(response, "Не удалось загрузить записи")

    registrations.value = Array.isArray(registrationsData) ? registrationsData : []
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : "Не удалось загрузить записи"
  } finally {
    isLoading.value = false
  }
}

const submitCancellation = async () => {
  errorMessage.value = null
  if (isSubmittingCancellation.value || !selectedRegistration.value) {
    return
  }

  isSubmittingCancellation.value = true

  try {
    const response = await axios.post(`${API_ROUTES.REGISTRATION}/cancel`, {
      id: selectedRegistration.value.id,
      reason: cancellationReason.value ? cancellationReason.value.trim() : '',
    })
    parseApiResponse(response, "Не удалось отменить запись")

    registrations.value = registrations.value.map((registration) =>
      registration.id === selectedRegistration.value.id
        ? {
            ...registration,
            status: 'cancelled',
            cancelReason: cancellationReason.value ? cancellationReason.value.trim() : '',
          }
        : registration
    )
    closeCancelModal()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : "Не удалось отменить запись"
  } finally {
    isSubmittingCancellation.value = false
  }
}


const filteredRegistrations = computed(() => {
  const normalizedSearchQuery = debouncedSearchQuery.value.trim().toLowerCase()

  return registrations.value.filter((registration) => {
    const matchesStatus = !selectedStatus.value || registration.status === selectedStatus.value
    const registrationSearchText = `${registration.user.lastName} ${registration.user.firstName} ${registration.user.email}`.toLowerCase()
    const matchesSearch = !normalizedSearchQuery || registrationSearchText.includes(normalizedSearchQuery)

    return matchesStatus && matchesSearch
  })
})


const openCancelModal = async (registration) => {
  selectedRegistration.value = registration
  cancellationReason.value = registration.cancelReason ?? ''
  isCancelModalOpen.value = true

  await nextTick()
  cancelModalContainer.value?.focus()
}

const closeCancelModal = () => {
  isCancelModalOpen.value = false
  selectedRegistration.value = null
  cancellationReason.value = ''
}

const isRegistrationsEmpty = computed(() => {
  return registrations.value.length === 0
})

const isFilteredRegistrationsEmpty = computed(() => {
  return filteredRegistrations.value.length === 0
})

const formatRegistrationDate = (registeredAt) => {
  if (typeof registeredAt !== 'string' || !registeredAt.trim()) {
    return 'Дата недоступна'
  }

  return registeredAt.split(' ').slice(0, 2).join(' ')
}


onMounted(() => {
  fetchRegistrations()
})

</script>
<style lang="css" scoped>
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

  .errorMessage {
      color: var(--color-status-cancelled)
  }
</style>
