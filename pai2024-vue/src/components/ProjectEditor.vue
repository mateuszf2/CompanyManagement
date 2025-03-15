<script>

const projectEndpoint = '/api/project'
const personEndpoint = '/api/person'

import TaskList from './TaskList.vue';


export default {
    components: { TaskList },
    data() {
        return {
            isValid: false,
            input: {},
            rules: {
                startsWithLetter: value => {
                    const pattern = /^\p{L}/u
                    return pattern.test(value) || 'Wymagane zaczynanie się od litery'
                },
                validDate: value => {
                    const date = new Date(value)
                    return !!date || `Wymagana prawidłowa data`
                }
            },
            persons: [],
            showTasks: false
        }
    },
    props: ['project','user'],
    emits: ['close', 'listChanged'],
    methods: {
        send() {
            fetch(projectEndpoint, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.input)
            }).then(res => {
                res.json().then(data => {
                    if (!res.ok) {
                        this.$emit('close', data.error, 'error')
                    } else {
                        this.input = {}
                        this.$emit('close', `Projekt ${data.name} - dodano`)
                        this.$emit('listChanged')
                    }
                }).catch(() => {
                    this.$emit('close', 'Dane odrzucone', 'error')
                })
            })
        },
        update() {
            fetch(projectEndpoint, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.input)
            }).then(res => {
                res.json().then(data => {
                    if (!res.ok) {
                        this.$emit('close', data.error, 'error')
                    } else {
                        this.input = {}
                        this.$emit('close', `Projekt ${data.name} - zaktualizowano`)
                        this.$emit('listChanged')
                    }
                }).catch(() => {
                    this.$emit('close', 'Dane odrzucone', 'error')
                })
            })
        },
        remove() {
            fetch(projectEndpoint + '?' + new URLSearchParams({ _id: this.input._id }), {
                method: 'DELETE'
            }).then(res => {
                res.json().then(data => {
                    if (!res.ok) {
                        this.$emit('close', data.error, 'error')
                    } else {
                        this.input = {}
                        this.$emit('close', `Projekt ${data.name} - usunięto`)
                        this.$emit('listChanged')
                    }
                }).catch(() => {
                    this.$emit('close', 'Dane odrzucone', 'error')
                })
            })
        },
        setData(data) {
            this.input = {}
            Object.assign(this.input, data)
        },
        clear() {
            this.input = { _id: this.input._id }
            this.isValid = false
        },
        close() {
            this.$emit('close')
        },
        toggleTasks() {
        console.log("Przycisk 'Zadania' kliknięty, obecny stan:", this.showTasks);
        console.log("Czy input._id istnieje?:", this.input._id);
        console.log("Czy warunek v-if spełniony?:", this.showTasks && this.input._id);
        this.showTasks = !this.showTasks;
    }
    },
    mounted() {
    console.log("🔥 ProjectEditor.vue został zamontowany!");
    Object.assign(this.input, this.project);
    console.log("ProjectEditor.vue zamontowany. input._id:", this.input._id);

    fetch(personEndpoint + '?' +  new URLSearchParams({ sort: 'lastName', order: 'asc' }).toString())
        .then(res => res.json().then(facet => {
            if (!facet.error) {
                this.persons = facet.data;
            }
        }));
    }

}
</script>

<template>
    <v-form v-model="isValid">
        <v-card>
            <v-card-title>{{ input._id ? 'Edytuj dane' : 'Wprowadź dane nowej osoby' }}</v-card-title>
            <v-card-subtitle>
                Dane muszą spełniać odpowiednie reguły, zarówno w tym formularzu, jak i w backendzie.
            </v-card-subtitle>
            <v-card-text>
                <v-text-field variant="outlined" label="Nazwa" v-model="input.name" :rules="[ rules.startsWithLetter ]">
                </v-text-field>
                <v-text-field type="date" variant="outlined" label="Data startu" v-model="input.startDate" :rules="[ rules.validDate ]">
                </v-text-field>
                <v-text-field type="date" variant="outlined" label="Data końca" v-model="input.endDate" :rules="[ rules.validDate ]">
                </v-text-field>
                <v-autocomplete variant="outlined"
                    v-model="input.contractor_ids"
                    :items="persons"
                    :item-title="item => item.firstName + ' ' + item.lastName"
                    item-value="_id"
                    label="Wykonawcy"
                    multiple chips
                ></v-autocomplete>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="elevated" @click="clear">Zeruj</v-btn>
                <v-btn color="primary" variant="elevated" @click="send" :disabled="!isValid" v-if="!input._id">Wyślij</v-btn>
                <v-btn color="secondary" variant="elevated" @click="update" :disabled="!isValid" v-if="input._id">Aktualizuj</v-btn>
                <v-btn color="error" variant="elevated" @click="remove" v-if="input._id">Usuń</v-btn>
                <v-btn variant="elevated" @click="toggleTasks">Zadania</v-btn>
                <v-btn variant="elevated" @click="close">Zamknij</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>

    <v-dialog v-model="showTasks" width="60%">
        <TaskList v-if="showTasks && input._id" @close="showTasks = false" :projectId="input._id" :user="user" />
    </v-dialog>
</template>

<style scoped>
</style>
