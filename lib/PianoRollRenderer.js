import {toRaw} from 'vue'

export class PianoRollRenderer {
    constructor(canvas, transport) {
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.transport = transport
      this.noteColor = 'white'
      this.backgroundColor = 'black'
      this.zoomLevel = 1
      this.scrollX = 0
      this.barLockPos = 0.125
      this.devicePixelRatio = window.devicePixelRatio || 1
      this.title = ""
  
      this.setupCanvas()
      this.setupEvents()
    }
  
    setupCanvas() {
      const rect = this.canvas.getBoundingClientRect()
      this.canvas.width = rect.width * this.devicePixelRatio
      this.canvas.height = rect.height * this.devicePixelRatio
      toRaw(this.ctx).scale(this.devicePixelRatio, this.devicePixelRatio)
    }
  
    setNoteColor(color) {
      this.noteColor = color
      this.draw()
    }
  
    setBackgroundColor(color) {
      this.backgroundColor = color
      this.draw()
    }
  
    draw() {
      this.clearCanvas()
      this.drawNotes()
      let [playheadOffScreen, pos] = this.drawPlayhead(this.transport.position)
      if (playheadOffScreen) {
        this.scrollX = this.transport.position - this.barLockPos / this.zoomLevel
      }
      
    }
  
    clearCanvas() {
      toRaw(this.ctx).fillStyle = this.backgroundColor
      toRaw(this.ctx).fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    setTitle(title) {
      this.title = title
      this.draw()
    }
  
    drawNotes() {
      if (!this.transport.getMidiData()) return
      
      const duration = this.transport.getMidiData().duration
      const visibleDuration = duration / this.zoomLevel
      const startTime = this.scrollX * duration
      const endTime = startTime + visibleDuration
      
      this.transport.getMidiData().tracks.forEach(track => {
        track.notes.forEach(note => {
          if (note.time + note.duration >= startTime && note.time <= endTime) {
            const grayValue = 128 + Math.floor(note.velocity * 127)
            toRaw(this.ctx).fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`
            
            const x = ((note.time - startTime) / visibleDuration) * this.canvas.width
            const y = this.canvas.height - (note.midi * 3)
            const width = (note.duration / visibleDuration) * this.canvas.width
            
            toRaw(this.ctx).fillRect(x, y, width, 3)
          }
        })
      })
      // Draw text top left in dark green with title
      toRaw(this.ctx).fillStyle = 'darkgreen'
      toRaw(this.ctx).font = '24px Fira Code, monospace'
      toRaw(this.ctx).fillText(this.title, 40, 40)
    }
  
    drawPlayhead(position) {
      toRaw(this.ctx).fillStyle = 'red'
      let pos = ((position - this.scrollX) * this.canvas.width * this.zoomLevel)
      
      toRaw(this.ctx).fillRect(pos, 0, 2, this.canvas.height)
      // pos > this.canvas.width
      return [Math.abs(pos - this.barLockPos * this.canvas.width) > 0.001, pos]
    }
  
    zoom(delta) {
      this.zoomLevel = Math.min(Math.max(Math.exp(Math.log(this.zoomLevel) + delta), 0.1), 2000)
      this.draw()
    }
  
    setupEvents() {
      this.canvas.addEventListener('wheel', this.handleWheel.bind(this))
    }
  
    handleWheel(event) {
      const delta = event.deltaY * -0.005
      this.zoom(delta)
    }
  }