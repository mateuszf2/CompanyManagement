<script>

    const dataEndpoint = '/data'

    export default {
        data() {
            return {
                data: {},
                isValid: false,
                snackbar: false,
                snackbar_text: '',
                snackbar_color: '',
                rules: {
                    startsWithLetter: value => {
                        const pattern = /^\p{L}/u
                        return pattern.test(value) || 'Wymagane zaczynanie się od litery'
                    },
                    onlyDigits: value => {
                        const pattern = /^\d+$/
                        return pattern.test(value) || 'Wyłącznie cyfry'
                    },
                    validYear: value => {
                        const rok = parseInt(value)
                        return (rok >= 1900 && rok <= 2024) || 'Wymagana wartość od 1900 do 2024'
                    }
                }
            }
        },
        emits: [ 'historyChanged' ],
        methods: {
           popup(text, color) {
                this.snackbar_text = text
                this.snackbar_color = color
                this.snackbar = true
           },
           send() {
              fetch(dataEndpoint, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.data)
              }).then(res => {
                res.json().then(data => {
                    if(!data.set) {
                        this.popup(data.validation, 'red')
                    } else {
                        this.popup('Dane dodane', 'green')
                        this.$emit('historyChanged')
                    }
                }).catch(err => {
                    this.popup('Dane odrzucone', 'red')
                })
              })
           }  
         },
        mounted() {
            fetch(dataEndpoint, {
                method: 'GET'
            }).then(res => res.json().then(
                obj => {
                    this.data = obj
                }
            )).catch(err => {
                this.popup('Backend nie zwrócił odpowiedzi, czy w ogóle pracuje?', 'red')
            })
        }
    }
</script>

<template>
    <v-form v-model="isValid">
        <v-card variant="outlined">
            <v-card-title>Wprowadź opis roku</v-card-title>
            <v-card-subtitle>
                Dane muszą spełniać odpowiednie reguły, zarówno w tym formularzu, jak i w backendzie.
                Dodatkowo, nie możesz wysłać dwa razy opisu tego samego roku.
            </v-card-subtitle>
            <v-card-text>
                <v-text-field type="number" variant="outlined" label="Rok" v-model="data.year" :rules="[ rules.onlyDigits, rules.validYear ]">
                </v-text-field>
                <v-text-field variant="outlined" label="Opis" v-model="data.description" :rules="[ rules.startsWithLetter ]">
                </v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="elevated" @click="send()" :disabled="!isValid">Wyślij</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>

    <v-snackbar v-model="snackbar" variant="outlined" :color="snackbar_color" :timeout="5000">
      {{ snackbar_text }}
      <template v-slot:actions>
        <v-btn :color="snackbar_color" variant="elevated" @click="snackbar = false">
          Zamknij
        </v-btn>
      </template>
    </v-snackbar>
</template>

<style scoped>
</style>