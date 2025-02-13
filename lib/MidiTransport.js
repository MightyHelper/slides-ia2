import * as Tone from 'tone'
import {toRaw} from 'vue'
import { Midi } from '@tonejs/midi'

export class MidiTransport {
  midiData
  constructor() {
    // this.synth = new Tone.PolySynth().toDestination()
    this.synth = new Tone.Sampler({
      urls: {
        "C3": "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        "A3": "A3.mp3",
        "C4": "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        "A4": "A4.mp3",
        "C5": "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        "A5": "A5.mp3",
        "C6": "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        "A6": "A6.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();
    this.midiData = null
    this.scheduledEvents = []
    this.isPlaying = false
    this.output = null
    this.lastStoppedPosition = 0
    this.WebMidi = null
    this.onUpdateCallback = () => {}
  }

  async loadMidi(url) {
    console.log("Loading midi data");
    try{
    this.midiData = await Midi.fromUrl(`${url}`)
    console.log("Loaded midi data", toRaw(this.midiData));
    }catch(e){
      console.error(`Bad midi url: ${url}`, e)
      throw e
    }
  }

  getMidiData(){
    return toRaw(this.midiData)
  }

  async play(startTime) {
    // If already was playing, but is stopped, resume
    if (this.lastStoppedPosition > 0) {
      startTime = this.lastStoppedPosition
    }
    await Tone.start()
    Tone.Transport.seconds = startTime
    this.scheduleNotes()
    Tone.Transport.start()
    this.isPlaying = true
    this.startPositionUpdate()
  }

  async pause() {
    Tone.Transport.pause()
    this.stopAllNotes()
    this.isPlaying = false
    this.stopPositionUpdate()
    this.lastStoppedPosition = Tone.Transport.seconds
    this.clearScheduledEvents()
  }

  stop() {
    Tone.Transport.stop()
    this.stopAllNotes()
    this.clearScheduledEvents()
    this.isPlaying = false
    this.stopPositionUpdate()
    this.lastStoppedPosition = 0
  }

  seek(position) {
    Tone.Transport.seconds = position * this.getMidiData().duration
  }

  onUpdate(callback) {
    this.onUpdateCallback = callback
  }

  startPositionUpdate() {
    this.positionUpdater = setInterval(() => {
      this.onUpdateCallback(Tone.Transport.seconds / this.getMidiData().duration)
    }, 50)
  }

  stopPositionUpdate() {
    clearInterval(this.positionUpdater)
  }
  async playNote(note){
    this.outputChannel.playNote(note.midi, {
      duration: parseInt(note.duration * 1000),
      attack: note.velocity
    })
  }
  scheduleNotes() {
    this.clearScheduledEvents()
    this.getMidiData().tracks.forEach(track => {
      track.notes.forEach(note => {
        const event = Tone.Transport.schedule(time => {
          if (this.output === 'web-synth') {
            toRaw(this.synth).triggerAttackRelease(
              note.name,
              note.duration,
              time,
              note.velocity
            )
          }else{
            this.playNote(note)
          }
        }, note.time)
        this.scheduledEvents.push(event)
      })
    })
  }

  stopAllNotes() {
    toRaw(this.synth).releaseAll()
    // Add MIDI all notes off implementation here
  }

  clearScheduledEvents() {
    this.scheduledEvents.forEach(event => Tone.Transport.clear(event))
    this.scheduledEvents = []
  }

  dispose() {
    this.stop()
    toRaw(this.synth).dispose()
  }
}