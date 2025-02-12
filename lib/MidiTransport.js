import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'

export class MidiTransport {
  midiData
  constructor() {
    this.synth = new Tone.PolySynth().toDestination()
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
    
    this.midiData = await Midi.fromUrl(`${url}`)
    console.log("Loaded midi data", this.midiData);
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
    Tone.Transport.seconds = position * this.midiData.duration
  }

  onUpdate(callback) {
    this.onUpdateCallback = callback
  }

  startPositionUpdate() {
    this.positionUpdater = setInterval(() => {
      this.onUpdateCallback(Tone.Transport.seconds / this.midiData.duration)
    }, 50)
  }

  stopPositionUpdate() {
    clearInterval(this.positionUpdater)
  }

  scheduleNotes() {
    console.log("Scheduling notes");
    
    this.clearScheduledEvents()
    this.midiData.tracks.forEach(track => {
      track.notes.forEach(note => {
        const event = Tone.Transport.schedule(time => {
          console.log(this.output)
          if (this.output === 'web-synth') {
            this.synth.triggerAttackRelease(
              note.name,
              note.duration,
              time,
              note.velocity
            )
          }else{
            // Use this.WebMidi
            this.WebMidi.outputs[this.output].playNote(note.midi, note.velocity, {
              duration: note.duration
            })
          }
        }, note.time)
        this.scheduledEvents.push(event)
      })
    })
  }

  stopAllNotes() {
    this.synth.releaseAll()
    // Add MIDI all notes off implementation here
  }

  clearScheduledEvents() {
    this.scheduledEvents.forEach(event => Tone.Transport.clear(event))
    this.scheduledEvents = []
  }

  dispose() {
    this.stop()
    this.synth.dispose()
  }
}