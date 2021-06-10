// Setting Constants
const DEV_URL  = "http://localhost:5000";
const PROD_URL  = "";
const ROOT_URL = DEV_URL;
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const qTypes = ["artist", "album", "track"];

// Setting Variables
let chart_1_el = document.getElementById("chart-1");
let period = "week";
let dOffset = 1;
let percentCount = 0;

let daily_scrobbles = {
  mon: 0,
  tue: 0,
  wed: 0,
  thr: 0,
  fri: 0,
  sat: 0,
  sun: 0
}
let prev_daily_scrobbles = {
  mon: 0,
  tue: 0,
  wed: 0,
  thr: 0,
  fri: 0,
  sat: 0,
  sun: 0
}

// Changes Period and Resets Offset
// Section Header
const changePeriod = (perio, selection) => {
  period = perio;
  dOffset=1;
  
  $('.period-tabs').removeClass('font-bold').addClass('font-medium');
  $(selection).addClass('font-bold').removeClass('font-medium'); 
  
  refresh(dOffset,period);
  
};


// Next Button
// Timeline Explorer
const next_btn = () => { 
  console.log(dOffset);
  if (dOffset <= 1)
    return;
  dOffset--; 
  refresh(dOffset,period);
};

// Previous Button
// Timeline Explorer
const prev_btn = () => {
  if(period == "year" && dOffset == 3)
    return;
  dOffset++;
  refresh(dOffset, period);
};



// Returns Date in friendly format
// Timeline Explorer
const getDate = date => {
    let day = parseInt(date.substr(8));
    let month = monthNames[parseInt(date.substr(5,2)) - 1]
    let year = date.substr(0,4);
    return `${day} ${month} ${year}`;
}

// Gets Information for Listening Week 
// Section 2
const daily_plays = (offset,period) => {
  Object.keys(daily_scrobbles).forEach(v => daily_scrobbles[v] = 0);
  Object.keys(prev_daily_scrobbles).forEach(k => prev_daily_scrobbles[k] = 0);
  if (dOffset == 1) {
    $("#next_period").removeClass("text-gray-500 cursor-pointer").addClass("text-gray-300");
  } else {
    $("#next_period").addClass("text-gray-500 cursor-pointer").removeClass("text-gray-300");
  }
  if (window.chart_one)
    window.chart_one.destroy();
  $.ajax({
    url: `${ROOT_URL}/tracksplayed/${period}/${offset}`,
    crossDomain: true,
    success: (res) => {
      
      // $("#time_period").html(`${(res.requestParams.period.from == "Beginning") ? "Day 1" : getDate(res.requestParams.period.from)} - ${getDate(res.requestParams.period.to)}`)
      if (res.requestParams.period.from == "Beginning") {
        $("#time_period").html("Day 1");
        $("#last-week").html("");
      } else {
        $("#time_period").html(`${getDate(res.requestParams.period.from)} - ${getDate(res.requestParams.period.to)}`);
        $("#last-week").html(`<span class="font-bold text-md text-gray-400 ml-3" id="prev_week_scrobbles">...</span><br>
        <span class="font-medium text-sm text-gray-600 ml-3">Listened to a total of <span class="font-medium text-sm text-gray-400" id="prev_week_hours">...</span> Hours</span> `)
      }

      for (let i = 0; i < res.results.length; i++) {
        switch (res.results[i].weekday) {
          case "Monday":
            daily_scrobbles.mon++;
            break;
          case "Tuesday":
            daily_scrobbles.tue++;
            break;
          case "Wednesday":
            daily_scrobbles.wed++;
            break;
          case "Thursday":
            daily_scrobbles.thr++;
            break;
          case "Friday":
            daily_scrobbles.fri++;
            break;
          case "Saturday":
            daily_scrobbles.sat++;
            break;
          case "Sunday":
            daily_scrobbles.sun++;
            break;
          
          default:
            break;
        }
      }
      let most_days = Object.keys(daily_scrobbles).reduce((a, b) => daily_scrobbles[a] > daily_scrobbles[b] ? a : b);

      switch(most_days) {
        case "mon": most_days = "Monday"; break
        case "tue": most_days = "Tueday"; break
        case "wed": most_days = "Wednesday"; break
        case "thr": most_days = "Thursday"; break
        case "fri": most_days = "Friday"; break
        case "sat": most_days = "Saturday"; break
        case "sun": most_days = "Sunday"; break
        default: break;
      }
      $("#most_listens").html(most_days);
      $("#week_scrobbles").html(res.results.length);
      if (period == "all") {
        initChart(daily_scrobbles, null)
      } else {
        $.ajax({
          url: `${ROOT_URL}/tracksplayed/${period}/${offset + 1}`,
          crossDomain: true,
          success: (resd) => {
            console.log(resd)
            for (let i = 0; i < resd.results.length; i++) {
              switch (resd.results[i].weekday) {
                case "Monday":
                  prev_daily_scrobbles.mon++;
                  break;
                case "Tuesday":
                  prev_daily_scrobbles.tue++;
                  break;
                case "Wednesday":
                  prev_daily_scrobbles.wed++;
                  break;
                case "Thursday":
                  prev_daily_scrobbles.thr++;
                  break;
                case "Friday":
                  prev_daily_scrobbles.fri++;
                  break;
                case "Saturday":
                  prev_daily_scrobbles.sat++;
                  break;
                case "Sunday":
                  prev_daily_scrobbles.sun++;
                  break;
                
                default:
                  break;
              }
            }
            let prev_period_data = {
              label: `Previous ${period}`,
              backgroundColor: 'rgba(96, 165, 250, 0.5)',
              borderColor: "rgba(96, 165, 250, 0.5)",
              data: {
                Mon: prev_daily_scrobbles.mon,
                Tue: prev_daily_scrobbles.tue,
                Wed: prev_daily_scrobbles.wed,
                Thur: prev_daily_scrobbles.thr,
                Fri: prev_daily_scrobbles.fri,
                Sat: prev_daily_scrobbles.sat,
                Sun: prev_daily_scrobbles.sun,
              },
              stepped: true,

            }
            $("#prev_week_scrobbles").html(resd.results.length + " Scrobbles ");
            
            initChart(daily_scrobbles, prev_period_data);
          }
        });
        
       }
      }
  });
}

// Initiates Chart for Listening Week
// Section 2
const initChart = (data, prev_period_data) => {
  let chart_1_data = {
    datasets: [
      {
        label: `Current ${period}`,
        backgroundColor: "rgba(96, 165, 250)",
        borderColor: "rgba(96, 165, 250)",
        data: {
          Mon: data.mon,
          Tue: data.tue,
          Wed: data.wed,
          Thur: data.thr,
          Fri: data.fri,
          Sat: data.sat,
          Sun: data.sun,
        },
        stepped: true,
      },
    ],
  };
  if (prev_period_data) 
    chart_1_data.datasets.push(prev_period_data);
  else
    chart_1_data.datasets[0].label = "All Time";
  
  
  let delayed;
  const chart_1_config = {
    type: "bar",
    data: chart_1_data,
    options: {
      animation: {
        onComplete: () => {
          delayed = true;
        },
        delay: (context) => {
          let delay = 0;
          if (context.type === 'data' && context.mode === 'default' && !delayed) {
            delay = context.dataIndex * 1000 + context.datasetIndex * 100;
          }
          return delay;
        },
      },
      elements: {
        line: {
          tension: 0.4,
        }
      },
      legend: {
        display: false,
      },
      responsive: true,
      plugins: {
        title: {
          display: false,
          text: [`Listening Week [Scrobbles]`]
        },
      scales: {
        y: {
          type: 'linear',
          display: false,
          position: 'left',
          }
        },
      }
    },
  };

  window.chart_one = new Chart(chart_1_el, chart_1_config);
  chart_one.options.scales.y.display = false;
  chart_one.update()  
}

// Get Top {Album, Artist, Track} of Time Period
// Section 3
const topType = (offset, perio) => {
  const noartwork = "img/musical-note.svg"
  $.ajax({
    url: `${ROOT_URL}/top/track/${perio}/${offset}`,
    success: (topTracks) => {
      $("#top_track").html(topTracks.results[0].track);
      $("#top_track_artist").html(topTracks.results[0].artist);
      if (topTracks.results[0].album_image == null) {
        $("#top_track_img").attr("src", noartwork);
        $("#top_track_img").addClass("bg-gray-300");

      } else 
        $("#top_track_img").attr("src", topTracks.results[0].album_image);
      $("#top_track_plays").html(topTracks.results[0].plays + " plays");
      
      for (let k = 1; k <= 4; k++) {
        $(`#${k+1}_track`).html(topTracks.results[k].track);
        $(`#${k+1}_track_artist`).html(topTracks.results[k].artist);
        if (topTracks.results[k].album_image == null) {
          $(`#${k+1}_track_img`).addClass("bg-gray-300");
          $(`#${k+1}_track_img`).attr("src", noartwork);
        } else
          $(`#${k+1}_track_img`).attr("src", topTracks.results[k].album_image);
      }
    

    }
  });
  $.ajax({
    url: `${ROOT_URL}/top/album/${perio}/${offset}`,
    success: (topTracks) => {
      $("#top_album").html(topTracks.results[0].album);
      $("#top_album_artist").html(topTracks.results[0].artist);
      $("#top_album_img").attr("src", topTracks.results[0].album_image);
      $("#top_album_plays").html(topTracks.results[0].plays + " plays");

      for (let k = 1; k <= 4; k++) {
        $(`#${k+1}_album`).html(topTracks.results[k].album);
        $(`#${k+1}_album_artist`).html(topTracks.results[k].artist);
        if (topTracks.results[k].album_image == null) {
          $(`#${k+1}_album_img`).addClass("bg-gray-300");
          $(`#${k+1}_album_img`).attr("src", noartwork);
        } else
          $(`#${k+1}_album_img`).attr("src", topTracks.results[k].album_image);
      }
    }
  });
  $.ajax({
    url: `${ROOT_URL}/top/artist/${perio}/${offset}`,
    success: (topTracks) => {
      $("#top_artist").html(topTracks.results[0].artist);
      $("#top_artist_img").attr("src", topTracks.results[0].artist_image);
    
      $("#top_artist_plays").html(topTracks.results[0].plays + " plays");
      
      for (let k = 1; k <= 4; k++) {
        $(`#${k+1}_artist`).html(topTracks.results[k].artist)
        if (topTracks.results[k].artist_image == null) {
          $(`#${k+1}_artist_img`).attr("src",noartwork);
          $(`#${k+1}_artist_img`).addClass("bg-gray-300");
        } else
          $(`#${k+1}_artist_img`).attr("src", topTracks.results[k].artist_image);
      }
      
    }
  });
};

// Gets Total Scrobbles, Avg Daily Scrobbles, Listening Time, and Most Active Hour for Highlights 
// Section 4
const highlights = (dOffset, period) => {
  $.ajax({
    url: `${ROOT_URL}/duration/${period}/${dOffset}`,
    success: res => {
      let hour = parseInt(res.results[0].time_played.split(":")[0]);
      $("#listen1").html(hour);
      if (hour >= 24) {
        let day;
        parseInt(hour/24) > 1 ? day = " Days, " : day = " Day, ";
        s = parseInt(hour/24) + day + parseInt((hour/24 - parseInt(hour/24)) * 24) + " Hours";
        $("#highlights_listen").html(s);
      } else
      $("#highlights_listen").html(`${hour} Hours`);
      calcPercent("listen");
    }
  });
  if (period != "all")
    $.ajax({
      url: `${ROOT_URL}/duration/${period}/${dOffset + 1}`,
      success: resd => {
        $("#highlights_prev_listen").show();
        let hour = parseInt(resd.results[0].time_played.split(":")[0]);
        $("#listen2").html(hour);
        if (hour > 24) {
          let day
          parseInt(hour/24) > 1 ? day = " Days, " : day = " Day, ";
          k = "vs. " + parseInt(hour/24) + day + parseInt((hour/24 - parseInt(hour/24)) * 24) + ` Hours (Previous ${period.charAt(0).toUpperCase() + period.slice(1)}) &nbsp;`;
          $("#highlights_last_listen").html(k);
        } else
        $("#highlights_last_listen").html(`vs. ${hour} Hours (Previous Week) &nbsp;`);
        calcPercent("listen");
      }
    });
  else 
  $("#highlights_prev_listen").hide();
  $.ajax({
    url: `${ROOT_URL}/plays/${period}/${dOffset}`,
    success: res => {
      let plays = parseInt(res.results[0].plays);
      let avg_plays = parseInt(res.results[0].avg_plays);
      $("#scrobble1").html(plays);
      $("#avg1").html(avg_plays);

      $("#highlights_scrobbles").html(plays);
      $("#highlights_avg_scrobbles").html(avg_plays);
      calcPercent("avg");
      calcPercent("scrobble");
    }
  });
  if (period != "all")
    $.ajax({
      url: `${ROOT_URL}/plays/${period}/${dOffset + 1}`,
      success: resd => {
        $("#highlights_prev_scrobbles").show();
        $("#highlights_prev_avg").show();
        let plays = parseInt(resd.results[0].plays);
        let avg_plays = parseInt(resd.results[0].avg_plays);
        $("#scrobble2").html(plays);
        $("#avg2").html(avg_plays);

        $("#highlights_last_scrobbles").html(`vs. ${plays} (Previous ${period.charAt(0).toUpperCase() + period.slice(1)})`);
        $("#highlights_last_avg_scrobbles").html(`vs. ${avg_plays} (Previous ${period.charAt(0).toUpperCase() + period.slice(1)})`);
        calcPercent("avg");
        calcPercent("scrobble");
      }
    });
    else {
      $("#highlights_prev_scrobbles").hide();
      $("#highlights_prev_avg").hide();
    }
  $.ajax({
    url: `${ROOT_URL}/activehour/${period}/${dOffset}`,
    success: data => {
      let hour = data.results[0].hour;
      let plays = data.results[0].plays;
      $("#highlights_hour").html(`${hour < 10 ? "0" + hour : hour}:00  [${plays} Plays]`)
    }
  });
  if (period != "all")
    $.ajax({
      url: `${ROOT_URL}/activehour/${period}/${dOffset + 1}`,
      success: data => {
        $("#highlights_last_hour").show();
        let hour = data.results[0].hour;
        $("#highlights_last_hour").html(`vs. ${hour < 10 ? "0" + hour : hour}:00 (Previous ${period.charAt(0).toUpperCase() + period.slice(1)})`)
      }
    });
  else
    $("#highlights_last_hour").hide();
};

// Calculate Percentage Increase/Decrease for Highlights
// Section 4
const calcPercent = type => {
  percentCount++;
  if (percentCount == 2) {
    percentCount = 0;
    let val1 = $(`#${type}1`).html();
    let val2 = $(`#${type}2`).html();
    percent = parseInt((val1 - val2) / val2 * 100)
    // console.log(percent);
    if (percent < 0) { 
      percent = -percent
      $(`#highlights_${type}_arrow`).removeClass("rotate-180 ");
    }
    $(`#highlights_${type}_percent`).html(`${percent}%`);
  }
};

// Get New Discoveries
// Section 5
const discoveries = (dOffset, period, type) => {
  $.ajax({
    url: `${ROOT_URL}/totalnew/${type}/${period}/${dOffset}`,
    success: data => {
      let no = data.results[0].plays;
      $(`#discovery_${type}`).html(`${no} New ${upperFirst(type)}s`)
      $(`#discovery_${type}`).attr("data-no" ,no)
      $.ajax({
        url: `${ROOT_URL}/totalnew/${type}/${period}/${dOffset + 1}`,
        success: prev_data => {
          let prev_no = prev_data.results[0].plays;
          $(`#discovery_last_${type}`).html(`vs. ${prev_no} (Previous ${period})`)
          $(`#discovery_last_${type}`).attr("data-no" , prev_no)
          percent = parseInt((no - prev_no) / prev_no * 100)
          $(`#discovery_${type}_percent`).html(`${percent}%`)
          if (percent < 0)
            $(`#discovery_${type}_percent`).addClass("text-red-400").removeClass("text-green-400");
          else
            $(`#discovery_${type}_percent`).addClass("text-green-400").removeClass("text-red-400");
          }
      });
    }
  });
  $.ajax({
    url: `${ROOT_URL}/new/${type}/${period}/${dOffset}`,
    success: data => {
     $(`#discovery_top_${type}`).html(data.results[0].rtype);
     $(`#discovery_top_${type}_artist`).html(data.results[0].artist);
     $(`#discovery_top_${type}_img`).attr("src",data.results[0].img);
    }
  });

};


const upperFirst = str => str.charAt(0).toUpperCase() + str.slice(1);

// Image Loading Error Handler
const imgError = el => {
  console.log(el, "Image Servers seem to be down")
}


const refresh = (dOffset, period) => {
  daily_plays(dOffset, period);
  topType(dOffset, period);
  highlights(dOffset, period);
  discoveries(dOffset,period, "artist")
  discoveries(dOffset,period, "album")
  discoveries(dOffset,period, "track")
};

refresh(dOffset, period)
$("img").attr("onerror","imgError(this)")