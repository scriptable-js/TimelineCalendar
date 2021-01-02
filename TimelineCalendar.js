// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;

// ------------Parameters------------//
const DEFAULT_COLOR_HEX = '#ffffff';
const DEFAULT_COLOR = new Color(DEFAULT_COLOR_HEX, 0.3);
const HALF_HOUR_COLOR = new Color(DEFAULT_COLOR_HEX, 0.6);

DEFAULT_PARAMS = {
  bg: "medium-top", // background image to use
  width: 450,
  height: 250,
  hoursToShow: 3,
  calendars: [],        // All calendars by default
  excludeCalendars: [], // Exclude superceds selected calendar
  lineWidth: 10,
  ellipseWidth: 20,
  allDayEvents: true,  // Uncoment this or add to widget parameter to show two column events
  textToRight: true,    // Saves space by adding all texts to once side
};

Date.prototype.addHours = function (numHours) {
  const date = new Date(this.valueOf());
  date.setHours(date.getHours() + numHours);
  return date;
};

Date.prototype.addMinutes = function (numMinutes) {
  const date = new Date(this.valueOf());
  date.setMinutes(date.getMinutes() + numMinutes);
  return date;
};


// ------------Utility functions ------------//
addStack = (el, type = 'horizontal', centered = false, size) => {
  const stack = el.addStack()
  if (type === 'vertical') stack.layoutVertically()
  else stack.layoutHorizontally()
  
  if (centered) 
    stack.centerAlignContent()
    
  if (size) stack.size = size
  return stack
}

addText = (el, string, type, size = 9.5) => {
  const text = el.addText(string)
  text.font = type === 'bold' ?
    Font.boldSystemFont(size * 1.2) :
    Font.regularSystemFont(size)
  text.textOpacity = type === 'small' ? 0.5 : 1
  text.lineLimit = 2
  text.centerAlignText()
  return text;
}

addCenteredText = (el, text, type, size = 9.5) => {
  const stack = addStack(el, 'horizontal', true)
  stack.addSpacer()
  const textObj = addText(stack, text, type, size)
  stack.addSpacer()
  return textObj;
}

// ------------Class------------//
class TimelineCalendar {
  constructor(dParams, widget) {
    // parameters provided to the class overrides default parameters.
    this.params = { ...DEFAULT_PARAMS, ...dParams };
    this.widget = widget ? widget : this.initWidget();
    this.now = new Date();

    var context = new DrawContext();
    context.size = new Size(this.params.width, this.params.height);
    context.opaque = false;
    context.respectScreenScale = true;
    this.drawContext = context;

    this.xMiddlePosition = this.params.textToRight ? 10 : this.params.width / 2;

    this.colors = [
      Color.orange(),
      Color.cyan(),
      Color.blue(),
      Color.yellow(),
      Color.green(),
      Color.magenta(),
      Color.brown(),
    ];
  }

  drawLine = async (x, y, width, height, color) => {
    const path = new Path();
    path.addRect(new Rect(x, y, width, height));
    this.drawContext.addPath(path);
    this.drawContext.setFillColor(color);
    this.drawContext.fillPath();
  };

  drawHalfHourLines = async () => {
    const halfHours = this.params.hoursToShow * 2 + 1;
    const halfHourEllipseWidth = this.params.ellipseWidth * 1.2;
    var timeNow = new Date();
    timeNow.setMinutes(0);
    timeNow.setSeconds(0);
    for (var i = 0; i < halfHours; i++) {
      timeNow = timeNow.addMinutes(30);
      const xValue =
        this.xMiddlePosition -
        (halfHourEllipseWidth - this.params.lineWidth) / 2;
      const scaleYValue = this.scaleTimeToPixles(timeNow);
      this.drawEllipse(
        xValue,
        scaleYValue,
        halfHourEllipseWidth,
        2,
        HALF_HOUR_COLOR
      );
    }
  };

  drawEllipse = async (x, y, width, height, color = DEFAULT_COLOR) => {
    const path = new Path();
    path.addEllipse(new Rect(x, y, width, height));

    this.drawContext.setFillColor(color);
    this.drawContext.setTextColor(color);
    this.drawContext.addPath(path);
    this.drawContext.fillPath();
  };

  scaleTimeToPixles = (timeToScale) => {
    // Convert time to pixles on the yaxis
    const height = this.params.height;
    const totalDurationInMinutes = this.params.hoursToShow * 60;
    const pixlesPerMinute = Math.round(height / totalDurationInMinutes);

    var timeAtHour = new Date();
    timeAtHour.setSeconds(0);
    timeAtHour = timeAtHour.setMinutes(0);

    const timeInMinutes = Math.round(
      Math.abs(timeAtHour - timeToScale) / (1000 * 60)
    ); // Milliseconds to minutes

    return pixlesPerMinute * timeInMinutes; // pixles/minute * minute = pixles
  };

  drawCurrentTime = async () => {
    var scaledVal = this.scaleTimeToPixles(this.now);
    const xValue = this.xMiddlePosition - (30 - 10) / 2;
    this.drawEllipse(xValue, scaledVal, 30, 10, Color.white());
  };

  isInRange = (value, begin, end) => {
    return value >= begin && value <= end;
  };

  getEvents = async () => {
    const today = await CalendarEvent.today([]);
    const tomorrow = await CalendarEvent.tomorrow([]);
    const events = today.concat(tomorrow);

    var eventsToBeDisplayed = [];
    var alldayEvents = [];

    var currentHour = new Date();
    currentHour.setMinutes(0);
    currentHour.setSeconds(0);

    var endHour = new Date();
    endHour = endHour.addHours(this.params.hoursToShow);

    events.forEach((event) => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      if (!event.title) return; // No title = no calendar event
      //if (event.isAllDay) return; // Don't worry about all day events

      if (event.isAllDay) {
        if (start.getDate() == this.now.getDate()) alldayEvents.push(event);
        return;
      }

      var dupe = false;
      eventsToBeDisplayed.forEach((e) => {
        if (e.event.title == event.title) {
          dupe = true;
          return; // cannot break a forEach loop, need to return anoymouse function.
        }
      });

      if (dupe) return;

      const isStartInRange = this.isInRange(start, currentHour, endHour);
      const isEndInRange = this.isInRange(end, currentHour, endHour);
      const eventSubsumesRange = start <= currentHour && end >= endHour;
      const eventInSelectedCalendar =
        this.params.calendars.length === 0 ||
        this.params.calendars.includes(event.calendar.title);

      const eventCalendarExcluded = this.params.excludeCalendars.includes(
        event.calendar.title
      );

      if (eventCalendarExcluded) return;

      if (
        (isStartInRange || isEndInRange || eventSubsumesRange) &&
        eventInSelectedCalendar
      ) {
        var eventObj = {
          start: start,
          end: end,
          event: event,
          isStartInRange: isStartInRange,
          isEndInRange: isEndInRange,
        };
        eventsToBeDisplayed.push(eventObj);
      }
    });

    const allEvents = {
      timelineEvents: eventsToBeDisplayed,
      alldayEvents: alldayEvents,
    };
    return allEvents;
  };

  formatDateValue = (data) => {
    return ("0" + data).slice(-2);
  };

  drawEventsOnTheHour = async () => {
    const allEvents = await this.getEvents();
    const events = allEvents.timelineEvents;
    for (let [index, event] of Object.entries(events)) {
      const isEven = index % 2 === 0 && !this.params.textToRight;
      const color = this.colors[index % this.colors.length];

      var startY = 0;
      var endY = this.params.height;
      if (event.isStartInRange) startY = this.scaleTimeToPixles(event.start);
      if (event.isEndInRange) endY = this.scaleTimeToPixles(event.end);

      // Change this line if you want the text to be shown to one side.
      if (isEven) this.drawContext.setTextAlignedRight();
      else this.drawContext.setTextAlignedLeft();

      this.drawContext.setFillColor(color);
      this.drawContext.setTextColor(color);

      const textRect = new Rect(
        isEven ? 0 : this.xMiddlePosition + 20,
        startY,
        this.params.width / 2 - 20,
        20
      );
      const timeText = ` (${event.start.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}) `;

      // Move the time near the line
      const text = isEven
        ? event.event.title + timeText
        : timeText + event.event.title;
      this.drawContext.drawTextInRect(text, textRect);

      // Position the ellipse a the center of the line. Since they both start
      // at the same 'x' we need to subtract some to get to the center.
      const xValue =
        this.xMiddlePosition -
        (this.params.ellipseWidth - this.params.lineWidth) / 2;
      this.drawEllipse(xValue, startY, this.params.ellipseWidth, 2, color);
      this.drawEllipse(xValue, endY, this.params.ellipseWidth, 2, color);
      this.drawLine(
        this.xMiddlePosition,
        startY,
        this.params.lineWidth,
        endY - startY,
        color
      );
    }
    return allEvents;
  };

  handleAlldayEvents = async (stack, events) => {
    const text =
      events.length === 0 ? "All Day Events? - Nope" : "All Day Events";
    console.log("da faq");
    addCenteredText(stack, text, "Bold", 8).textColor = new Color(DEFAULT_COLOR_HEX);
    console.log("da faq");
    stack.addSpacer(10);
    console.log("da faq");

    console.log(events);

    events.forEach((e) => {
      addCenteredText(
        stack,
        `-> ${e.title}`,
        "normal",
        8
      ).color = new Color(`#${e.calendar.color.hex}`);
    });
    stack.addSpacer();
  };

  drawCalendarWidget = async (stack) => {
    const row1 = addStack(stack);
    const vStack1 = addStack(row1, "vertical", false);

    await this.drawLine(
      this.xMiddlePosition,
      0, // y
      10, // width
      this.params.height,
      DEFAULT_COLOR
    );
    await this.drawHalfHourLines();
    await this.drawCurrentTime();
    const allEvents = await this.drawEventsOnTheHour();

    vStack1.addImage(this.drawContext.getImage());

    if (this.params.allDayEvents) {
      const vStack2 = addStack(row1, "vertical", false, new Size(80,0));
      this.handleAlldayEvents(vStack2, allEvents.alldayEvents);
      vStack2.addSpacer();
    }
  };

  // Use this method to create a widet it this is a standalone widget.
  initWidget() {
    return new ListWidget();
  }
}

// Note you can use this class as a module and import it other widgets,
// Just call 'drawCalendarWidget' with a new stack.
// module.exports = LineCalendar;

// ------------Widget Code------------//
// parameters provided to the class overrides default parameters.
// Check the default parameters at the top of the file for more info.
var params = {}
if (args.widgetParameter != null) params = JSON.parse(args.widgetParameter);

const lineCalendar = new TimelineCalendar(params);

const w = lineCalendar.initWidget();
// var stack = addStack(w, "vertical", true);
await lineCalendar.drawCalendarWidget(w);
// w.backgroundImage = files.readImage(lineCalendar.params.bg); // use your own background here
w.backgroundColor = Color.black();

w.presentMedium();
Script.setWidget(w);
Script.complete();
