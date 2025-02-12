export class PianoRollRenderer {
    constructor(canvas, transport) {
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      this.transport = transport
      this.noteColor = 'white'
      this.backgroundColor = 'black'
      this.zoomLevel = 64
      this.scrollX = 0
      this.barLockPos = 0.125
      this.devicePixelRatio = window.devicePixelRatio || 1
  
      this.setupCanvas()
      this.setupEvents()
    }
  
    setupCanvas() {
      const rect = this.canvas.getBoundingClientRect()
      this.canvas.width = rect.width * this.devicePixelRatio
      this.canvas.height = rect.height * this.devicePixelRatio
      this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio)
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
      this.ctx.fillStyle = this.backgroundColor
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
  
    drawNotes() {
      if (!this.transport.midiData) return
      
      const duration = this.transport.midiData.duration
      const visibleDuration = duration / this.zoomLevel
      const startTime = this.scrollX * duration
      const endTime = startTime + visibleDuration
  
      this.transport.midiData.tracks.forEach(track => {
        track.notes.forEach(note => {
          if (note.time + note.duration >= startTime && note.time <= endTime) {
            const grayValue = 128 + Math.floor(note.velocity * 127)
            this.ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`
            
            const x = ((note.time - startTime) / visibleDuration) * this.canvas.width
            const y = this.canvas.height - (note.midi * 3)
            const width = (note.duration / visibleDuration) * this.canvas.width
            
            this.ctx.fillRect(x, y, width, 3)
          }
        })
      })
    }
  
    drawPlayhead(position) {
      this.ctx.fillStyle = 'red'
      let pos = ((position - this.scrollX) * this.canvas.width * this.zoomLevel)
      
      this.ctx.fillRect(pos, 0, 2, this.canvas.height)
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