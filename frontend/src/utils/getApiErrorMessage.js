export function getApiErrorMessage(apiError, fallbackMessage) {
  return apiError?.response?.data?.message || fallbackMessage;
}
