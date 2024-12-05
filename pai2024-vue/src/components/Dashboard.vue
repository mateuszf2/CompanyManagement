<script>
    export default {
        props: [ 'user' ],
        emits: [ 'popup' ]
    }
</script>

<template>
    <h1>Pulpit</h1>
    <b v-if="user.username">{{ user.username }}</b>
    <i v-if="!user.username">niezalogowany</i>
</template>