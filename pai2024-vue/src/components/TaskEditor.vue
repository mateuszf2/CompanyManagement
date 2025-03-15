<script>
const taskEndpoint = '/api/task';
const personEndpoint = '/api/person';

export default {
    data() {
        return {
            isValid: false,
            input: {},
            rules: {
                startsWithLetter: value => {
                    const pattern = /^\p{L}/u;
                    return pattern.test(value) || 'Wymagane zaczynanie się od litery';
                },
                validDate: value => {
                    const date = new Date(value);
                    return !!date || 'Wymagana prawidłowa data';
                }
            },
            persons: []
        };
    },
    props: ['selectedTask','projectId','user'],
    emits: ['close', 'taskUpdated'],
    methods: {
        send() {
            console.log("Wysyłane dane:", this.input); // Debugowanie
            fetch(taskEndpoint, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ ...this.input, project_id: this.projectId })

            })
            .then(res => res.json().then(data => {
                console.log("Odpowiedź serwera:", data); // Debugowanie
                if (!res.ok) {
                    this.$emit('close', data.error, 'error');
                } else {
                    this.input = {};
                    this.$emit('close', `Zadanie ${data.name} - dodano`);
                    this.$emit('taskUpdated');
                }
            }))
            .catch(err => {
                console.error("Błąd żądania:", err);
                this.$emit('close', 'Dane odrzucone', 'error');
            });
        },
        update() {
            fetch(taskEndpoint, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.input)
            }).then(res => res.json().then(data => {
                if (!res.ok) {
                    this.$emit('close', data.error, 'error');
                } else {
                    this.input = {};
                    this.$emit('close', `Zadanie ${data.name} - zaktualizowano`);
                    this.$emit('taskUpdated');
                }
            })).catch(() => {
                this.$emit('close', 'Dane odrzucone', 'error');
            });
        },
        remove() {
            fetch(taskEndpoint + '?' + new URLSearchParams({ _id: this.input._id }), {
                method: 'DELETE'
            }).then(res => res.json().then(data => {
                if (!res.ok) {
                    this.$emit('close', data.error, 'error');
                } else {
                    this.input = {};
                    this.$emit('close', `Zadanie ${data.name} - usunięto`);
                    this.$emit('taskUpdated');
                }
            })).catch(() => {
                this.$emit('close', 'Dane odrzucone', 'error');
            });
        },
        setData(data) {
            this.input = {};
            Object.assign(this.input, data);
        },
        clear() {
            this.input = { _id: this.input._id };
            this.isValid = false;
        },
        close() {
            this.$emit('close');
        }
    },
    mounted() {
        Object.assign(this.input, this.selectedTask);
        console.log("ID projektu:", this.projectId);

        fetch(`/api/project?_id=${this.projectId}`)
            .then(res => res.json())
            .then(response => {
                console.log("Odpowiedź z API projektu:", response);

                // Sprawdź, czy odpowiedź zawiera dane
                if (!response || !Array.isArray(response.data) || response.data.length === 0) {
                    throw new Error("Brak danych projektu lub nieprawidłowy format odpowiedzi");
                }

                // Znajdź projekt na podstawie `this.projectId`
                const project = response.data.find(proj => proj._id === this.projectId);
                if (!project) throw new Error("Nie znaleziono projektu o podanym ID");

                console.log("Dane projektu:", project);

                const projectContractors = project.contractor_ids || [];
                console.log("Wykonawcy projektu (IDs):", projectContractors);

                // Pobierz listę osób i przefiltruj po wykonawcach
                return fetch(personEndpoint + '?' + new URLSearchParams({ sort: 'lastName', order: 'asc' }).toString())
                    .then(res => res.json())
                    .then(facet => {
                        console.log("Lista wszystkich osób:", facet.data);

                        if (!facet || facet.error) throw new Error(facet?.error || "Brak danych osób");

                        // Filtrowanie osób według `contractor_ids`
                        this.persons = facet.data.filter(person => projectContractors.includes(person._id));
                        console.log("Osoby przypisane do projektu:", this.persons);
                    });
            })
            .catch(err => console.error("Błąd podczas pobierania danych:", err));
    }

};
</script>

<template>
    <v-form v-model="isValid">
        <v-card>
            <v-card-title>{{ input._id ? 'Edytuj zadanie' : 'Dodaj nowe zadanie' }}</v-card-title>
            <v-card-text>
                <v-text-field variant="outlined" label="Nazwa" v-model="input.name" :rules="[ rules.startsWithLetter ]"></v-text-field>
                <v-text-field type="date" variant="outlined" label="Data startu" v-model="input.startDate" :rules="[ rules.validDate ]"></v-text-field>
                <v-text-field type="date" variant="outlined" label="Data końca" v-model="input.endDate" :rules="[ rules.validDate ]"></v-text-field>
                <v-autocomplete variant="outlined" 
                v-model="input.contractor_ids" 
                :items="persons"
                :item-title="item => item.firstName + ' ' + item.lastName" 
                item-value="_id"
                label="Wykonawcy" 
                multiple chips>
                </v-autocomplete>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="elevated" @click="clear">Zeruj</v-btn>
                <v-btn color="primary" variant="elevated" @click="send" :disabled="!isValid" v-if="!input._id">Wyślij</v-btn>
                <v-btn color="secondary" variant="elevated" @click="update" :disabled="!isValid" v-if="input._id">Aktualizuj</v-btn>
                <v-btn color="error" variant="elevated" @click="remove" v-if="input._id">Usuń</v-btn>
                <v-btn variant="elevated" @click="close">Zamknij</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>