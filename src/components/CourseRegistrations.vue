<template>
  <div>
    <h2>Записи на курсы</h2>
    <div v-if="isLoading">Загрузка...</div>
    <div v-else>
      <CourseRegistrationsFilters
        v-model:search-query="searchQuery"
        v-model:selected-status="selectedStatus"
      />

      <div v-if="isRegistrationsEmpty">Записей пока нет</div>
      <div v-else-if="isFilteredRegistrationsEmpty">Ничего не найдено</div>
      <CourseRegistrationCard
        v-for="registration in filteredRegistrations"
        :key="registration.id"
        :registration="registration"
        @cancel="openCancelModal"
      />
    </div>

    <CancellationModal
      v-if="isCancelModalOpen"
      :registration="selectedRegistration"
      :cancellation-reason="cancellationReason"
      :is-submitting="isSubmittingCancellation"
      @close="closeCancelModal"
      @submit="submitCancellation"
      @update:cancellation-reason="cancellationReason = $event"
    />

    <div v-if="errorMessage" class="errorMessage">{{ errorMessage }}</div>
  </div>
</template>
<script setup>
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import CancellationModal from './CancellationModal.vue';
import CourseRegistrationCard from './CourseRegistrationCard.vue';
import CourseRegistrationsFilters from './CourseRegistrationsFilters.vue';
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

onMounted(() => {
  fetchRegistrations()
})

</script>
<style lang="css" scoped>
.errorMessage {
  color: var(--color-status-cancelled);
}
</style>
