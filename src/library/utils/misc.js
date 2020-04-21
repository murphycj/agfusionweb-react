
// create new event that is compatible with main browsers
// including IE
function createNewEvent(eventName) {
  var event;
  if (typeof(Event) === 'function') {
    event = new Event(eventName);
  } else {
    event = document.createEvent('Event');
    event.initEvent(eventName, true, true);
  }
  return event;
}

export { createNewEvent };
