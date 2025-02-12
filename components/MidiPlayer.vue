<!-- components/MidiPlayer.vue -->
<template>
  <div class="midi-player-container" :style="{ height: 50 }">
    <div class="controls">
      <button @click="togglePlay">{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <input type="range" v-model="playbackPosition" min="0" max="1" step="0.01" class="seek-slider">
      <input type="number" v-model="playbackSpeed" min="0.1" max="2" step="0.1" class="speed-input">
      <select v-model="selectedMidiOutput">
        <option value="web-synth">Web Synth</option>
        <option v-for="output in midiOutputs" :key="output.id" :value="output.id">
          {{ output.name }}
        </option>
      </select>
      <button @click="startRecording" :disabled="isRecording">Record Audio</button>
    </div>
    <canvas ref="canvas" class="piano-roll"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import * as Tone from 'tone'
import { WebMidi } from 'webmidi'
import { Midi } from '@tonejs/midi'

const props = defineProps({
  midiPath: {
    type: String,
    required: true
  },
  height: {
    type: String,
    default: '70vh'
  }
})

const containerHeight = computed(() => props.height)
const canvas = ref(null)
const isPlaying = ref(false)
const playbackPosition = ref(0)
const playbackSpeed = ref(1)
const midiOutputs = ref([])
const selectedMidiOutput = ref('web-synth')
const isRecording = ref(false)
let midiData = null
let canvasCtx = null
let animationFrame = null
let mediaRecorder = null
let recordedChunks = []

// Canvas dimensions
const canvasWidth = ref(0)
const canvasHeight = ref(400)
const noteHeight = 3

// Setup WebMidi and load MIDI file
onMounted(async () => {
  await setupWebMidi()
  await loadMidiFile()
  setupCanvas()
  setupTransport()
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
  midiData = await Midi.fromUrl(`/${props.midiPath}`)
  console.log(midiData);
  
}

function setupCanvas() {
  canvasCtx = canvas.value.getContext('2d')
  canvasWidth.value = canvas.value.parentElement.clientWidth
  canvas.value.width = canvasWidth.value
  canvas.value.height = canvasHeight.value
  drawPianoRoll()
}
function drawPianoRoll() {
  if (!midiData) return

  canvasCtx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Get total duration from MIDI file
  const duration = midiData.duration
  
  // Draw all tracks
  midiData.tracks.forEach(track => {
    track.notes.forEach(note => {
      const x = (note.time / duration) * canvasWidth.value
      const y = canvasHeight.value - (note.midi * noteHeight)
      const width = (note.duration / duration) * canvasWidth.value
      
      canvasCtx.fillStyle = '#4CAF50'
      canvasCtx.fillRect(x, y, width, noteHeight)
    })
  })

  // Draw playhead
  canvasCtx.fillStyle = 'red'
  canvasCtx.fillRect(playbackPosition.value * canvasWidth.value, 0, 2, canvasHeight.value)
}

function setupTransport() {
  Tone.Transport.scheduleRepeat(() => {
    playbackPosition.value = Tone.Transport.seconds / midiData.duration
    drawPianoRoll()
    if (playbackPosition.value >= 1) stopPlayback()
  }, 0.1)
}


watch(playbackSpeed, (speed) => {
  Tone.Transport.playbackRate = speed
})

watch(playbackPosition, (pos) => {
  if (isPlaying.value) {
    Tone.Transport.seconds = pos * midiData.duration
  }
})

async function startRecording() {
  if (!isRecording.value) {
    recordedChunks = []
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data)
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${props.midiPath.replace('.mid', '')}_recording.wav`
      a.click()
    }
    
    mediaRecorder.start()
    isRecording.value = true
  } else {
    mediaRecorder.stop()
    isRecording.value = false
  }
}


const synth = new Tone.PolySynth().toDestination()
let scheduledEvents = []

async function togglePlay() {
  if (isPlaying.value) {
    Tone.Transport.pause()
  } else {
    await Tone.start()
    scheduleNotes()
    Tone.Transport.start()
  }
  isPlaying.value = !isPlaying.value
}

function scheduleNotes() {
  // Clear existing scheduled notes
  scheduledEvents.forEach(event => event.clear())
  scheduledEvents = []

  midiData.tracks.forEach(track => {
    track.notes.forEach(note => {
      const event = Tone.Transport.schedule(time => {
        // Play through Web Synth
        if (selectedMidiOutput.value === 'web-synth') {
          synth.triggerAttackRelease(
            note.name,
            note.duration,
            time,
            note.velocity
          )
        }
        // Send to MIDI device
        if (selectedMidiOutput.value !== 'web-synth') {
          const output = WebMidi.getOutputById(selectedMidiOutput.value)
          output.playNote(note.midi, {
            time: time,
            duration: note.duration,
            attack: note.velocity
          })
        }
      }, note.time)
      scheduledEvents.push(event)
    })
  })
}

function stopPlayback() {
  Tone.Transport.stop()
  Tone.Transport.cancel()
  isPlaying.value = false
  playbackPosition.value = 0
  scheduledEvents.forEach(event => event.clear())
  scheduledEvents = []
}

</script>

<style>
.midi-player-container {
  width: 100%;
  position: relative;
}

.piano-roll {
  width: 100%;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  margin-top: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.seek-slider {
  flex-grow: 1;
  min-width: 200px;
}

.speed-input {
  width: 60px;
}
</style>