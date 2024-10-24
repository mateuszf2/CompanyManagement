<script>

    const historyEndpoint = '/history'

    export default {
        data() {
            return {
                history: {}
            }
        },
        methods: {
            retrieve() {
                fetch(historyEndpoint, {
                    method: 'GET'
                }).then(res => res.json().then(
                    obj => {
                        this.history = obj
                    }
                ))
            }
        },
        mounted() {
            this.retrieve()
        }
    }
</script>

<template>
    <v-card variant="outlined">
        <v-card-title>Historia</v-card-title>
        <v-card-text>
            <v-table density="compact">
                <thead>
                    <tr><th>Rok</th><th>Opis</th></tr>
                </thead>
                <tbody>
                    <tr v-for="year in Object.keys(history)">
                        <td>{{ year }}</td><td>{{ history[year] }}</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card-text>
    </v-card>
</template>

<style scoped>
</style>