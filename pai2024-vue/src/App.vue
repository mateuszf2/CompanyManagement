<script>
import PersonList from './components/PersonList.vue'

const authEndpoint = '/api/auth'

export default {
  components: { PersonList },
  data() {
    return {
      snackbar: { on: false },
      generalError: false,
      user: {}
    }
  },
  methods: {
    onPopup(text, color = 'success') {
      this.snackbar.text = text
      this.snackbar.color = color
      this.snackbar.on = true
    }
  },
  mounted() {
    fetch(authEndpoint)
    .then(res => {
        if(!res.ok) {
          this.generalError = true
          return
        }
        res.json().then(data => {
          if(data.sessionid) {
            this.user = data
          } else {
            this.generalError = true
          }
        })
    })
    .catch(err => {
      this.generalError = true
    })
  }
}
</script>

<template>
  <v-app v-if="!generalError">

    <v-navigation-drawer expand-on-hover rail permanent>

      <v-list nav>
        <v-list-item href="/#/" prepend-icon="mdi-home" title="Pulpit" exact />
        <v-list-item href="/#/persons" prepend-icon="mdi-account-tie-woman" title="Osoby" exact />
      </v-list>

    </v-navigation-drawer>

    <v-main>
      <router-view @popup="onPopup" :user="user"></router-view>
    </v-main>

    <v-snackbar v-model="snackbar.on" :color="snackbar.color">
      <div style="width: 100%; text-align: center;">{{ snackbar.text }}</div>
    </v-snackbar>

  </v-app>

  <v-snackbar v-model="generalError" color="error" location="center" timeout="-1">
    <div style="width: 100%; text-align: center;">Brak połączenia z backendem</div>
  </v-snackbar>
</template>

<style scoped></style>