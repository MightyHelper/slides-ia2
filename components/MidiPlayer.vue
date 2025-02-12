<!-- components/MidiPlayer.vue -->
<template>
    <div class="midi-player-container" :style="{ height: containerHeight }">
      <div class="controls">
        <button @click="togglePlay">{{ state.transport.isPlaying ? 'Pause' : 'Play' }}</button>
        <input type="range" v-model="playbackPosition" min="0" max="1" step="0.0001" class="seek-slider">
        <select v-model="selectedMidiOutput">
          <option value="web-synth">Web Synth</option>
          <option v-for="output in midiOutputs" :key="output.id" :value="output.id">
            {{ output.name }}
          </option>
        </select>
        <!-- <button @click="startRecording" :disabled="isRecording">Record Audio</button> -->
      </div>
      <canvas ref="canvas" class="piano-roll" @wheel.prevent="handleWheel"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, reactive, watch, computed, onBeforeUnmount } from 'vue'
  import { WebMidi } from 'webmidi'
  import { MidiTransport } from '/lib/MidiTransport'
  import { PianoRollRenderer } from '/lib/PianoRollRenderer'
  
  const props = defineProps({
    midiPath: {
      type: String,
      required: true
    },
    height: {
      type: String,
      default: '45vh'
    },
    startTime: {
      type: Number,
      default: 0
    }
  })
  
  const containerHeight = computed(() => props.height)
  const canvas = ref(null)
  const midiOutputs = ref([])
  const selectedMidiOutput = ref('web-synth')
  const isRecording = ref(false)
  const playbackPosition = ref(0);

  const state = reactive({
    transport: new MidiTransport(),
    pianoRoll: null
  })
  
  // Setup WebMidi and load MIDI file
  onMounted(async () => {
    console.log("Setup webmidi");
    
    await setupWebMidi()
    console.log("load midi file");

    await loadMidiFile()
    setupPianoRoll()
    setupTransportListeners()
  })
  
  onBeforeUnmount(() => {
    state.transport.dispose()
  })
  
  async function setupWebMidi() {
    await new Promise((resolve) => {
      WebMidi.enable((err) => {
        if (!err) midiOutputs.value = WebMidi.outputs
        resolve()
      })
    })
  }
  
  async function loadMidiFile() {
    await state.transport.loadMidi(`/${props.midiPath}`)
  }
  
  function setupPianoRoll() {
    console.log("Pref:, ", state.pianoRoll);
    
    state.pianoRoll = new PianoRollRenderer(canvas.value, state.transport)
    state.pianoRoll.setNoteColor('white')
    state.pianoRoll.setBackgroundColor('black')
    state.transport.output = selectedMidiOutput.value
  }
  
  function setupTransportListeners() {
    state.transport.onUpdate((position) => {
      playbackPosition.value = position
      state.transport.position = position
      state.pianoRoll.draw()
      console.log("transport update");
      
    })
  }
  
  function handleWheel(event) {
    const delta = event.deltaY * -0.001
    state.pianoRoll.zoom(delta)
  }
  
  async function togglePlay() {
    if (state.transport.isPlaying) {
      await state.transport.pause()
    } else {
      state.pianoRoll.setupCanvas()
      await state.transport.play(props.startTime)
    }
  }
  
  watch(playbackPosition, (pos) => {
    state.transport.seek(pos)
    state.pianoRoll.draw()
  })
  watch(selectedMidiOutput, (outputId) => {
    state.transport.output = outputId
    state.transport.outputChannel = WebMidi.getOutputById('output-2').channels[1]
    state.transport.WebMidi = WebMidi
  })
  
  // Recording functionality remains similar to previous implementation
  // ...
  </script>
  
  <style>
  .midi-player-container {
    --piano-roll-bg: black;
    --note-color: white;
    width: 100%;
    position: relative;
  }
  
  .piano-roll {
    width: 100%;
    height: calc(100% - 60px);
    background-color: var(--piano-roll-bg);
    border: 1px solid #ccc;
    margin-top: 10px;
  }
  
  .controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    height: 50px;
  }
  
  .seek-slider {
    flex-grow: 1;
    min-width: 200px;
  }
  
  .speed-input {
    width: 60px;
  }
  </style>