<script>
    export default {
        data() {
            return {
                dane: ''
            }
        },
        methods: {
           test() {
              fetch('/test', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ dane: this.dane })
              }).then(res => {
                res.json().then(data => {
                    if(!data.set) {
                        console.error('Backend nie przypisał wartości')
                    }
                }).catch(err => {
                    console.error('Backend nie zwrócił odpowiedzi w formacie JSON')
                })
              })
           } 
        },
        mounted() {
            fetch('/test', {
                method: 'GET'
            }).then(res => res.json().then(
                data => {
                    this.dane = data.dane
                }
            )).catch(err => {
                console.error('Backend nie zwrócił odpowiedzi w formacie JSON')
            })
        }
    }
</script>

<template>
    <v-card>
        <v-card-title>Wprowadź dane</v-card-title>
        <v-card-text>
            <v-text-field label="Dane" v-model="dane"></v-text-field>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="test()">Wyślij</v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
</style>