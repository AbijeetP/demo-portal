export default {
  data: function () {
    return {
      notification: '',
      errorNotification: ''
    }
  },
  methods: {
    showSuccessMessage: function (message) {
      this.notification ? this.notification.close() : ''
      this.notification = this.$notify({
        title: 'success',
        message: message,
        type: 'success',
        position: 'bottom-right',
        duration: 60000,
        customClass: 'success-notification'
      })
    },
    showErrorMessage: function (message) {
      this.errorNotification ? this.errorNotification.close() : ''
      this.errorNotification = this.$notify({
        title: 'Error',
        message: message,
        type: 'error',
        position: 'bottom-right',
        duration: 60000,
        customClass: 'error-notification'
      })
    }
  }
}
