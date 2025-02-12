<template>
    <button @click="navigate()" v-if="!props.query.includes('saved_outputs/nan')">▶️</button>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, defineProps, reactive, watch, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  query: {
    type: String,
    required: true
  },
  slide: {
    type: String,
    required: false
  },
})

const route = useRoute()
const router = useRouter()
function  navigate(){
    router.push({ query: { target: props.query }, path: props.slide })
}
</script>