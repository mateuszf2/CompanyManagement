<script>

    const dataEndpoint = '/data'

    export default {
        data() {
            return {
                data: {},
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
                        const rok = parseInt(value)
                        return (rok >= 1900 && rok <= 2024) || 'Wymagana wartość od 1900 do 2024'
                    }
                }
            }
        },
        methods: {
           send() {
              fetch(dataEndpoint, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.data)
              }).then(res => {
                res.json().then(data => {
                    if(!data.set) {
                        console.error('Backend nie przypisał wartości')
                    } else {
                        console.log('Dane w backendzie ustawione na', data.dane)
                    }
                }).catch(err => {
                    console.error('Backend nie zwrócił odpowiedzi w formacie JSON')
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
                    console.log('Pobrano dane z backendu', obj)
                }
            )).catch(err => {
                console.error('Backend nie zwrócił odpowiedzi w formacie JSON')
            })
        }
    }
</script>

<template>
    <v-form v-model="isValid">
        <v-card variant="outlined">
            <v-card-title>Wprowadź opis roku</v-card-title>
            <v-card-subtitle>Dane muszą spełniać odpowiednie reguły, zarówno w tym formularzu, jak i w backendzie</v-card-subtitle>
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
</template>

<style scoped>
</style>