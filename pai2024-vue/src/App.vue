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
  <v-app>

    <v-navigation-drawer expand-on-hover rail permanent>

      <v-list nav>
        <v-list-item href="/#/" prepend-icon="mdi-home" title="Pulpit" exact />
        <v-list-item href="/#/persons" prepend-icon="mdi-account-tie-woman" title="Osoby" exact />
      </v-list>

    </v-navigation-drawer>

    <v-main>
      <router-view @popup="onPopup"></router-view>
    </v-main>

    <v-snackbar v-model="snackbar.on" :color="snackbar.color">
      <div style="width: 100%; text-align: center;">{{ snackbar.text }}</div>
    </v-snackbar>

  </v-app>
</template>

<style scoped></style>