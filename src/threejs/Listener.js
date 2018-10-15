class Listener {
  constructor(element) {
    this.element = element || window
    this.events = {}

    this.handleEvent = this.handleEvent.bind(this)
  }

  on(name, callback) {
    if(!this.events.hasOwnProperty(name)) {
      this.events[name] = []
      this.element.addEventListener(name, this.handleEvent)
    } 

    this.events[name].push(callback)
  }

  off(name, callback) {
    if (this.events.hasOwnProperty(name)) {
      this.events[name] = this.events[name].filter(x => x !== callback)
      this.element.removeEventListener(name, this.handleEvent)
    }
  }

  handleEvent(e) {
    const handlerOfType = this.events[e.type]

    if (handlerOfType) handlerOfType.forEach(callback => {
      callback(e)
    })

  }
}

export default Listener