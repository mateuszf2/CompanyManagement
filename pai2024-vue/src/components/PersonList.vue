<script>
    import PersonEditor from './PersonEditor.vue'

    const personEndpoint = '/api/person'

    export default {
        components: { PersonEditor },
        data() {
            return {
                persons: {},
                id: null,
                editor: false
            }
        },
        methods: {
            retrieve() {
                fetch(personEndpoint, {
                    method: 'GET'
                }).then(res => res.json().then(
                    obj => {
                        this.persons = obj
                    }
                ))
            },
            click(data) {
                this.id = data._id || null
                this.editor = true
            }
        },
        mounted() {
            this.retrieve()
        }
    }
</script>

<template>
    <v-card variant="outlined">
        <v-card-title>Osoby</v-card-title>
        <v-card-text>
            <v-table density="compact">
                <thead>
                    <tr><th>Imię</th><th>Nazwisko</th><th>Data urodzenia</th></tr>
                </thead>
                <tbody>
                    <tr v-for="personObj in persons" @click="click(personObj)">
                        <td>{{ personObj.firstName }}</td><td>{{ personObj.lastName }}</td><td>{{ new Date(personObj.birthDate).toLocaleDateString() }}</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card-text>
    </v-card>

    <v-dialog v-model="editor" width="50%">
        <PersonEditor :id="id"/>
    </v-dialog>
</template>

<style scoped>
</style>