/**
 * The function sends a message to the chat by bot
 * 
 * @param  {string} msg Text to be sent
 * @param  {number} chat_id
 * @param  {string} api Bot's API
 */
function send(msg, chat_id, api) {
  var payload = {
  'method': 'sendMessage',
  'chat_id': String(chat_id),
  'text': msg,
  'parse_mode': 'HTML'
  }
  var data = {
    'method': 'post',
    'payload': payload,
    'muteHttpExceptions': true
  }
    UrlFetchApp.fetch('https://api.telegram.org/bot' + api + '/', data);
}

/**
 * The function gets all events for today from 2 calendars and sorts them
 * 
 * @return {array} events_details_arr all sorted events for today
 */
function getEvents() {
  const calendar_ct = CalendarApp.getCalendarById(gmail_login_1)
  const calendar_ns = CalendarApp.getCalendarById(gmail_login_2)
  const now = new Date();
  const events_ct = calendar_ct.getEventsForDay(now);
  const events_ns = calendar_ns.getEventsForDay(now);
  const events = events_ct.concat(events_ns);
  const regExp = /<(?!\/?a>|\/?a href|\/?br)[^>]+>/g;
  const events_details_arr = new Array();

  events.forEach((el) => {
    let descr = el.getDescription().toString();
    const title = el.getTitle();
    let start_time = el.getStartTime();
    start_time = new Date(start_time.getTime() + (6 * 60 * 60 * 1000)) //6 - разница во времени между NY и Berlin
    if (descr === '') {
      events_details_arr.push([title,start_time]);
    } else {
      descr = descr.replace(regExp,'').replace(/<br>/g,`\n`);
      events_details_arr.push([title,start_time,`\n${descr}`]);
    }
  })

  bubble_sort(events_details_arr)

  return events_details_arr
}



/**
 * The function sorts array by bubble sort
 * 
 * @param {array} arr unsorted array 
 * @return {array} arr sorted array
 */
function bubble_sort(arr) {
    for (i=0; i<arr.length; i++) {
    for (j=0; j<arr.length-i-1; j++) {
      if (arr[j][1] > arr[j+1][1]) {
        let temp = arr[j];
        arr[j] = arr[j+1];
        arr[j+1] = temp;
      }
    }
  }
  return arr
}

/**
 * The function transforms the date into a string
 * 
 * @param {date} date The date to be transformed
 * @return {array} time_str the time in the string form
 */
function time_to_string(date) {
  let h = new String(date.getHours());
  let m = new String(date.getMinutes());
  if (m.length == 1) {
    m = `0${m}`
  }
  const time_str = ` ${h}:${m}`;

  return time_str
}


function send_next_event() {
  const today_events_arr = getEvents();
  const cur_time = new Date(new Date().getTime() + (6 * 60 * 60 * 1000)) //6 - разница во времени между NY и Berlin
  let msg = new String();

  for (i=0; i<today_events_arr.length; i++) {
    let substract = today_events_arr[i][1].getTime() - cur_time.getTime();
    if (substract/36000000 < 0.02 && substract > 0.1) {
      today_events_arr[i][1] = time_to_string(today_events_arr[i][1]);

    if (msg == "") {
        msg = `${today_events_arr[i].flat()}`
      } else {
        msg = `${msg}\n${today_events_arr[i].flat()}`
      }
      send(msg,chat_id_root,API);
    }
  }
}

function send_all_events() {
  const today_events_arr = getEvents();
  let msg = new String();

  if (today_events_arr.length !== 0) {
    today_events_arr.forEach((el,ind) => {
      el[1] = time_to_string(el[1])
      if (msg == "") {
        msg = `${ind+1} ${el.flat()}`
      } else {
        msg = `${msg}\n${ind+1} ${el.flat()}`
      }
      Logger.log(msg)
    })

    send(msg, chat_id_root, API);

  } else {
    send('В календаре нет планов', chat_id_root, API);
  }
}

function send_all_events_trigger() {
  const today_events_arr = getEvents();
  let msg = new String();

  for (i=0; i<today_events_arr.length; i++) {
    today_events_arr[i][1] = time_to_string(today_events_arr[i][1]);
    if (msg == "") {
      msg = `${i+1} ${today_events_arr[i].flat()}`
    } else {
      msg = `${msg}\n${i+1} ${today_events_arr[i].flat()}`
    }
  }

  if (msg.length>0) {
    send(msg, chat_id_root, API);
  }
}

