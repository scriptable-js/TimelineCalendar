# TimelineCalendar

This is a javascript file which works with scriptable app (for iOS/Mac).

# Usage

Download the Javascript file to your scriptable directory and execute it. 

# Configuration

This widget can be configured in multiple ways, 

## Widget with text on on side (saves space)


![Oneside](https://github.com/scriptable-js/TimelineCalendar/blob/main/assets/oneside.jpeg?raw=true)

You can either update the `DEFAULT_PARAMS` or provide the parameters as a json object from the widget.

`textToRight: true,    // Saves space by adding all texts to once side -->`

or

`{ "textToRight" : true}` // as a parameter into the widget

## Other configurations are listed below, feel free to update these as you wish

```
  bg: "medium-top", // background image to use
  width: 450,
  height: 250,
  hoursToShow: 3,
  calendars: [],        // All calendars by default
  excludeCalendars: [], // Exclude superceds selected calendar
  lineWidth: 10,
  ellipseWidth: 20,
  allDayEvents: true,  // Uncoment this or add to widget parameter to show two column events
  textToRight: false,    // Saves space by adding all texts to once side
```

## 

![Oneside with all day events](https://github.com/scriptable-js/TimelineCalendar/blob/main/assets/oneside_withallday.jpeg?raw=true)

![Twosides with all day events](https://github.com/scriptable-js/TimelineCalendar/blob/main/assets/twosides_withallday.jpeg?raw=true)

![Twosides](https://github.com/scriptable-js/TimelineCalendar/blob/main/assets/twosides.jpeg?raw=true)