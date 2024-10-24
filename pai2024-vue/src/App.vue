<script>
  import YearInput from './components/YearInput.vue'
  import YearsHistory from './components/YearsHistory.vue'

  export default {
    components: { YearInput, YearsHistory },
    methods: {
      onHistoryChanged() {
        this.$refs.yearsHistory.retrieve()
      }
    }
  }
</script>

<template>
  <YearsHistory ref="yearsHistory"/>
  <YearInput @history-changed="onHistoryChanged"/>
</template>

<style scoped>
</style>
