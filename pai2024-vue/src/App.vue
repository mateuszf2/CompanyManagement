<script>
  import PersonList from './components/PersonList.vue'

  export default {
    components: { PersonList },
    data() {
      return {
        snackbar: { on: false }
      }
    },
    methods: {
      onPopup(text, color = 'success') {
        this.snackbar.text = text
        this.snackbar.color = color
        this.snackbar.on = true
      }
    }
  }
</script>

<template>
  <PersonList ref="personList" @popup="onPopup"/>

  <v-snackbar v-model="snackbar.on" :color="snackbar.color" :timeout="5000">
      {{ snackbar.text }}
  </v-snackbar>
</template>

<style scoped>
</style>