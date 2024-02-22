import moment from 'moment'

export const updateMomentJSConfig = () => {
  // Set relative dates format (1 day ago, 3 weeks ago, etc)
  moment.updateLocale('en', {
    relativeTime : {
      future: "in %s",
      past: "%s", // "%s ago"
      s  : '%ds',
      ss : '%ds',
      m:  "1m",
      mm: "%dm",
      h:  "1h", // 1 hour ago
      hh: "%dh",
      d:  "1d",
      dd: "%dd",
      w:  "1w",
      ww: "%dw",
      M:  "1m", //change this for month
      MM: "%dm",
      y:  "1y",
      yy: "%dy"
    }
  });
}
