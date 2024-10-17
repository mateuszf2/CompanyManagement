<script>

    const daneEndpoint = '/dane'

    export default {
        data() {
            return {
                dane: '',
                isValid: false,
                rules: {
                    startsWithLetter: value => {
                        const pattern = /^\p{L}/u
                        return pattern.test(value) || 'Wymagane zaczynanie się od litery'
                    }
                }
            }
        },
        methods: {
           ustaw() {
              fetch(daneEndpoint, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ dane: this.dane })
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
            fetch(daneEndpoint, {
                method: 'GET'
            }).then(res => res.json().then(
                data => {
                    this.dane = data.dane
                    console.log('Pobrano dane z backendu', data.dane)
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
            <v-card-title>Wprowadź dane</v-card-title>
            <v-card-subtitle>Dane muszą spełniać odpowiednie reguły, zarówno w tym formularzu, jak i w backendzie</v-card-subtitle>
            <v-card-text>
                <v-text-field variant="outlined" label="Dane" v-model="dane" :rules="[ rules.startsWithLetter ]"
                    hint="Te dane będą wysłane do backendu">
                </v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="elevated" @click="ustaw()" :disabled="!isValid">Ustaw</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<style scoped>
</style>