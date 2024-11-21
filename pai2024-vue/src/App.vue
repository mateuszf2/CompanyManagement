<script>
  import PersonEditor from './components/PersonEditor.vue'
  import PersonList from './components/PersonList.vue'

  export default {
    components: { PersonEditor, PersonList },
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
      },
      onListChanged() {
        this.$refs.personList.retrieve()
      },
      onDataClicked(data) {
        this.$refs.personEditor.setData(data)
      }
    }
  }
</script>

<template>
  <PersonList ref="personList" @data-clicked="onDataClicked"/>
  <PersonEditor ref="personEditor" @popup="onPopup" @list-changed="onListChanged"/>

  <v-snackbar v-model="snackbar.on" :color="snackbar.color" :timeout="5000">
      {{ snackbar.text }}
  </v-snackbar>
</template>

<style scoped>
</style>