<script>

    const historyEndpoint = '/history'

    export default {
        data() {
            return {
                input: {},
                isValid: false,
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
                        const year = parseInt(value)
                        const currentYear = new Date().getFullYear()
                        return (year >= 1900 && year <= currentYear) || `Wymagana wartość od 1900 do ${currentYear}`
                    }
                }
            }
        },
        emits: [ 'popup', 'historyChanged' ],
        methods: {
           send() {
              fetch(historyEndpoint, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.input)
              }).then(res => {
                res.json().then(data => {
                    if(!res.ok) {
                        this.$emit('popup', data.error, 'red')
                    } else {
                        this.input = {}
                        this.$emit('popup', 'Dane dodane', 'green')
                        this.$emit('historyChanged')
                    }
                }).catch(err => {
                    this.$emit('popup', 'Dane odrzucone', 'red')
                })
              })
           }  
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
                <v-text-field type="number" variant="outlined" label="Rok" v-model="input.year" :rules="[ rules.onlyDigits, rules.validYear ]">
                </v-text-field>
                <v-text-field variant="outlined" label="Opis" v-model="input.description" :rules="[ rules.startsWithLetter ]">
                </v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="elevated" @click="send()" :disabled="!isValid">Wyślij</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>

</template>

<style scoped>
</style>