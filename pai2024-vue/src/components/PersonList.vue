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
                editor: false,
                itemsPerPage: 5,
                headers: [
                        { title: 'Imię', key: 'firstName', align: 'start', sortable: true },
                        { title: 'Nazwisko', key: 'lastName', align: 'start' },
                        { title: 'Data urodzenia', key: 'birthDate', align: 'end' }
                    ],
                loading: false,
                search: '',
                serverItems: []
            }
        },
        methods: {
            loadItems({ page, itemsPerPage, sortBy }) {
                this.loading = true
                const skip = (page - 1) * itemsPerPage
                let queryString = { skip, limit: itemsPerPage, search: this.search }
                if(sortBy && sortBy[0]) {
                    queryString.sort = sortBy[0].key
                    queryString.order = sortBy[0].order
                }            
                fetch(personEndpoint + '?' + 
                new URLSearchParams(queryString).toString())
                .then(res => res.json().then(body => {
                    this.serverItems = body
                    this.loading = false
                }))
            },
            retrieve() {
                fetch(personEndpoint, {
                    method: 'GET'
                }).then(res => res.json().then(
                    obj => {
                        this.persons = obj
                        this.persons = []
                    }
                ))
            },
            clickItem(item, event) {
                this.person = event.item
                this.person.birthDate = event.item.birthDate.substr(0, 10)
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
            <!--v-table density="compact">
                <thead>
                    <tr><th>Imię</th><th>Nazwisko</th><th>Data urodzenia</th></tr>
                </thead>
                <tbody>
                    <tr v-for="personObj in persons" @click="click(personObj)">
                        <td>{{ personObj.firstName }}</td><td>{{ personObj.lastName }}</td><td>{{ new Date(personObj.birthDate).toLocaleDateString() }}</td>
                    </tr>
                </tbody>
            </v-table-->
            <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
                :items-length="1000" :loading="loading" :search="search"
                @update:options="loadItems" @click:row="clickItem">
                <template v-slot:tfoot>
                    <tr>
                        <td colspan="2">
                            <v-text-field v-model="search" class="ma-2" variant="outlined" density="compact" placeholder="search..."
                                hide-details></v-text-field>
                        </td>
                    </tr>
                </template>
            </v-data-table-server>
        </v-card-text>
    </v-card>

    <v-dialog v-model="editor" width="50%">
        <PersonEditor :person="person" @close="editorClose" @list-changed="retrieve"/>
    </v-dialog>
</template>

<style scoped>
</style>