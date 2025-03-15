<script>
import common from '../mixins/common'
import TaskEditor from './TaskEditor.vue';
const taskEndpoint = '/api/task';

export default {
    components: { TaskEditor },
    mixins: [ common ],
    props: [ 'user','projectId' ],
    emits: ['popup','close'],
    data() {
        return {
            tasks: {},
            selectedTask: {},
            editor: false,
            itemsPerPage: 10,
            headers: [
                { title: 'Nazwa', key: 'name', align: 'start', sortable: true },
                { title: 'Data startu', key: 'startDate', align: 'end', sortable: true },
                { title: 'Data końca', key: 'endDate', align: 'end', sortable: true },
                { title: 'Wykonawcy', key: 'contractors', align: 'end', sortable: false }
            ],
            loading: false,
            search: '',
            itemsLength: 0,
            serverItems: [],
            tableKey: 0
        };
    },
    methods: {
        fetchTasks({ page, itemsPerPage, sortBy,search }) {
            this.loading = true;
            const skip = (page - 1) * itemsPerPage;
            
            let queryString = { 
                skip, 
                limit: itemsPerPage, 
                project_id: this.projectId 
            };

            if (search) queryString.search = search;  // ✅ Dodaj search tylko jeśli istnieje

            if (sortBy && sortBy[0]) {
                queryString.sort = sortBy[0].key;
                queryString.order = sortBy[0].order;
            } else {
                queryString.sort = 'name';
                queryString.order = 'asc';
            }

            fetch(taskEndpoint + '?' + new URLSearchParams(queryString).toString())
            .then(res => res.json().then(facet => {
                if (!facet.error) {
                    this.itemsLength = +facet.total;
                    this.serverItems = facet.data;
                }
                this.loading = false;
            }));
        },
        clickItem(item, event) {
            this.selectedTask = event.item;
            this.editor = true;
        },
        addTask() {
            this.selectedTask = {};
            this.editor = true;
        },
        editorClose(text, color) {
            this.editor = false;
            if (text) {
                this.$emit('popup', text, color);
            }
        }
    }
};
</script>


<template>
    
    <v-card v-if="checkIfInRole(user, [0, 1])">
        <v-card-title class="d-flex">
            Zadania
            <v-spacer></v-spacer>
            <v-btn @click="addTask" v-if="checkIfInRole(user, [0, 1])">Dodaj</v-btn>
            <v-btn @click="$emit('close')">Zamknij</v-btn>

        </v-card-title>
        <v-card-text>
            <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
                :items-length="itemsLength" :loading="loading" :search="search" :key="tableKey"
                @update:options="fetchTasks" @click:row="clickItem"
                itemsPerPageText="# elementów na stronie" pageText="{0}-{1} z {2}">
                <template #item.birthDate="{ item }">
                    {{ new Date(item.birthDate).toLocaleDateString() }}
                </template>
                <template #item.contractors="{ item }">
                    {{ item.contractors.join(' ') }}
                </template>
                <template #footer.prepend>
                    <v-text-field v-model="search" class="mr-5" variant="outlined" density="compact" placeholder="szukaj..."
                        hide-details prepend-icon="mdi-magnify"></v-text-field>
                </template>
            </v-data-table-server>
        </v-card-text>
    </v-card>

    <v-dialog v-model="editor" width="60%" v-if="checkIfInRole(user, [0, 1])">
        <TaskEditor :selectedTask="selectedTask" :projectId="projectId" :user="user" @close="editorClose" @list-changed="tableKey++" @taskUpdated="fetchTasks({ page: 1, itemsPerPage })"/>
    </v-dialog>
</template>

<style scoped>
</style>
