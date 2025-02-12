<template>
    <MidiPlayer :midiPath="selected_src"></MidiPlayer>
    <button @click="close()">Back</button>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

import { ref, onMounted, reactive, watch, computed, onBeforeUnmount } from 'vue'
import { onSlideEnter, onSlideLeave, useIsSlideActive } from '@slidev/client'
const route = useRoute()
const router = useRouter()
const selected_src = ref(route.query.target);
function close(){
    router.go(-1)
}
onSlideEnter(()=>{
    selected_src.value = route.query.target;
})
</script>

<style>
</style>