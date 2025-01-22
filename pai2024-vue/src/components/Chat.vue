<script>
export default {
    props: [ 'user' ],
    data() {
        return {
            websocket: null,
            recipient: '',
            message: '',
            posts: []
        }
    },
    methods: {
        send() {
            this.websocket.send(JSON.stringify({ from: this.user.username, to: this.recipient, message: this.message }))
            this.message = ''
        }
    },
    mounted() {
        this.websocket = new WebSocket('ws://' + window.location.host + '/ws')
        this.websocket.onopen = () => {
            console.log('Websocket połączony')
        }
        this.websocket.onmessage = event => {
            let data = {}
            try {
                data = JSON.parse(event.data)
            } catch(err) {
                console.error('Oczekiwano JSONa, a jest', event.data)
                return
            }
            this.posts.push({ time: Date.now(), ...data })
        }
    }
}
</script>

<template>
    <v-card variant="text">
        <v-card-title>Chat</v-card-title>
        <v-card-text>
            <v-list>
                <v-list-item v-for="post in posts">{{ new Date(post.time).toLocaleTimeString() }} @{{ post.from}} {{ post.message }}</v-list-item>
            </v-list>
        </v-card-text>
        <v-card-actions>
            <v-form style="width: 100%;">
                <v-row>
                <v-col cols="4">
                    <v-text-field variant="solo" v-model="recipient" label="Odbiorca"></v-text-field> 
                </v-col>
                <v-col>
                <v-text-field variant="solo" label="Wiadomość" v-model="message">
                    <template #append-inner>
                        <v-btn variant="elevated" color="success" @click="send" type="submit">Wyślij</v-btn>
                    </template>
                </v-text-field>
                </v-col>
                </v-row>
            </v-form>
        </v-card-actions>
    </v-card>
</template>
  
<style scoped>
</style>