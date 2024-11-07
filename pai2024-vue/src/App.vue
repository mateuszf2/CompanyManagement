<script>
  import YearInput from './components/YearInput.vue'
  import YearsHistory from './components/YearsHistory.vue'

  export default {
    components: { YearInput, YearsHistory },
    data() {
      return {
        snackbar: { on: false }
      }
    },
    methods: {
      onPopup(text, color) {
        this.snackbar.text = text
        this.snackbar.color = color
        this.snackbar.on = true
      },
      onHistoryChanged() {
        this.$refs.yearsHistory.retrieve()
      },
      onDataClicked(data) {
        this.$refs.yearInput.setData(data)
      }
    }
  }
</script>

<template>
  <YearsHistory ref="yearsHistory" @data-clicked="onDataClicked"/>
  <YearInput ref="yearInput" @popup="onPopup" @history-changed="onHistoryChanged"/>

  <v-snackbar v-model="snackbar.on" :color="snackbar.color" :timeout="5000">
      {{ snackbar.text }}
  </v-snackbar>
</template>

<style scoped>
</style>
