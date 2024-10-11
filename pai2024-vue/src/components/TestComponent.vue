<script>

    const daneEndpoint = '/dane'

    export default {
        data() {
            return {
                dane: ''
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
           },
           rozszerz() {
              fetch(daneEndpoint, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ dane: this.dane })
              }).then(res => {
                res.json().then(data => {
                    if(!data.set) {
                        console.error('Backend nie przypisał wartości')
                    } else {
                        this.dane = data.dane
                        console.log('Dane w backendzie ustawione na', data.dane)
                    }
                }).catch(err => {
                    console.error('Backend nie zwrócił odpowiedzi w formacie JSON')
                })
              })
           },
           wyzeruj() {
              fetch(daneEndpoint, {
                method: 'DELETE'
              }).then(res => {
                res.json().then(data => {
                    if(!data.set) {
                        console.error('Backend nie wyzerował wartości')
                    } else {
                        this.dane = data.dane
                        console.log('Dane w backendzie ustawione na', data.dane)
                    }
                }).catch(err => {
                    console.error('Backend nie zwrócił odpowiedzi w formacie JSON')
                })
              })
           },
           niepoprawneDane() {
             // czy pierwszy znak jest literą
             if(RegExp(/^\p{L}/, 'u').test(this.dane)) return false
             return true
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
    <v-card variant="outlined">
        <v-card-title>Wprowadź dane</v-card-title>
        <v-card-subtitle>Dane muszą spełniać odpowiednie reguły, zarówno w tym formularzu, jak i w backendzie</v-card-subtitle>
        <v-card-text>
            <v-text-field variant="outlined" label="Dane" v-model="dane" hint="Ciąg musi rozpoczynać się od litery"></v-text-field>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="elevated" @click="ustaw()" :disabled="niepoprawneDane()">Ustaw</v-btn>
            <v-btn color="secondary" variant="elevated" @click="rozszerz()">Rozszerz</v-btn>
            <v-btn color="error" variant="elevated" @click="wyzeruj()">Wyzeruj</v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
</style>