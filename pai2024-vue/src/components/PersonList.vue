<script>
    import PersonEditor from './PersonEditor.vue'

    const personEndpoint = '/api/person'

    export default {
        components: { PersonEditor },
        emits: [ 'popup' ],
        data() {
            return {
                persons: {},
                person: {},
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
                this.person = data
                this.editor = true
            },
            add() {
                this.person = {}
                this.editor = true
            },
            editorClose(text, color) {
                this.editor = false
                if(text) {
                    this.$emit('popup', text, color)
                }
            }
        },
        mounted() {
            this.retrieve()
        }
    }
</script>

<template>
    <v-card variant="outlined">
        <v-card-title>
            Osoby
            <v-btn @click="add">Dodaj</v-btn>
        </v-card-title>
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
        <PersonEditor :person="person" @close="editorClose" @list-changed="retrieve"/>
    </v-dialog>
</template>

<style scoped>
</style>