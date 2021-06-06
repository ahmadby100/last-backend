$(() => {
  try {
    const fireApp = firebase.app();
    const fireFeatures = ["functions"].filter(
      (fireFeatures) => typeof fireApp[fireFeatures] === "function"
    );
    console.log("Firebase loaded with functions");
    $("#load").html(`Firebase loaded with "Functions"`);
  } catch (err) {
    console.log(`Error loading the Firebase SDK: ${err}`);
  }
  
  
});

$("#features").hide();
// $("#mobile").hide();
$(window).click(() => {
  $("#features").hide();
  $("#mobile").hide();
});

$("#features-btn").click(() => {
  $("#features").show();
  console.log("Show");
});

$("#features").click((event) => {
  event.stopPropagation();
});

$("#features-btn").click((event) => {
  event.stopPropagation();
});

$("#mobile-close").click((event) => {
  $("#mobile").hide();
});

$("#mobile-open").click((event) => {
  $("#mobile").show();
});


var chart_1_el = document.getElementById("chart-1");
var chart_2_el = document.getElementById("chart-2");
var chart_one;
let period = "week";


const time_periods = (selection, period) => {
  $('.period-tabs').removeClass('font-bold').addClass('font-medium');
  $(selection).addClass('font-bold').removeClass('font-medium'); 
  daily_plays(dOffset,period);
};


const next_btn = () => { 
  console.log(dOffset);
  if (dOffset <= 1)
    return;
  dOffset--; 
  daily_plays(dOffset,period)
};
const prev_btn = () => {
  if(period == "year" && dOffset == 3)
    return;
  dOffset++;
  daily_plays(dOffset, period);
}

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
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getDate = date => {
    let day = parseInt(date.substr(8));
    let month = monthNames[parseInt(date.substr(5,2)) - 1]
    let year = date.substr(0,4);
    return `${day} ${month} ${year}`;
}
let dOffset = 1;



const daily_plays = (offset,period) => {
  if (dOffset == 1) {
    $("#next_period").removeClass("text-gray-500 cursor-pointer").addClass("text-gray-300");
  } else {
    $("#next_period").addClass("text-gray-500 cursor-pointer").removeClass("text-gray-300");
  }
  if (chart_one)
    chart_one.destroy();
  $.ajax({
    url: `/tracksplayed/${period}/${offset}`,
    success: (res) => {
      
      $("#time_period").html(`${(res.requestParams.period.from == "Beginning") ? "Day 1" : getDate(res.requestParams.period.from)} - ${getDate(res.requestParams.period.to)}`)


      for (let i = 0; i < res.results.length; i++) {
        if (new Date(res.results[i].date).getDay() == 1)
        daily_scrobbles.mon++;
        if (new Date(res.results[i].date).getDay() == 2)
        daily_scrobbles.tue++;
        if (new Date(res.results[i].date).getDay() == 3)
        daily_scrobbles.wed++;
        if (new Date(res.results[i].date).getDay() == 4)
        daily_scrobbles.thr++;
        if (new Date(res.results[i].date).getDay() == 5)
        daily_scrobbles.fri++;
        if (new Date(res.results[i].date).getDay() == 6)
        daily_scrobbles.sat++;
        if (new Date(res.results[i].date).getDay() == 0)
        daily_scrobbles.sun++;
      }
      $.ajax({
        url: `/tracksplayed/${period}/${offset + 1}`,
        success: (resd) => {
          console.log(resd)
          for (let i = 0; i < resd.results.length; i++) {
            if (new Date(resd.results[i].date).getDay() == 1)
            prev_daily_scrobbles.mon++;
            if (new Date(resd.results[i].date).getDay() == 2)
            prev_daily_scrobbles.tue++;
            if (new Date(resd.results[i].date).getDay() == 3)
            prev_daily_scrobbles.wed++;
            if (new Date(resd.results[i].date).getDay() == 4)
            prev_daily_scrobbles.thr++;
            if (new Date(resd.results[i].date).getDay() == 5)
            prev_daily_scrobbles.fri++;
            if (new Date(resd.results[i].date).getDay() == 6)
            prev_daily_scrobbles.sat++;
            if (new Date(resd.results[i].date).getDay() == 0)
            prev_daily_scrobbles.sun++;
          }
          $("#week_scrobbles").html(res.results.length);
          $("#prev_week_scrobbles").html(resd.results.length + " Scrobbles - ");
          const chart_1_data = {
            datasets: [
              {
                label: `This ${period}`,
                backgroundColor: "#191414",
                data: {
                  Mon: daily_scrobbles.mon,
                  Tue: daily_scrobbles.tue,
                  Wed: daily_scrobbles.wed,
                  Thur: daily_scrobbles.thr,
                  Fri: daily_scrobbles.fri,
                  Sat: daily_scrobbles.sat,
                  Sun: daily_scrobbles.sun,
                },
              },
              {
                label: `Last ${period}`,
                backgroundColor: "#5e5e5e",
                data: {
                  Mon: prev_daily_scrobbles.mon,
                  Tue: prev_daily_scrobbles.tue,
                  Wed: prev_daily_scrobbles.wed,
                  Thur: prev_daily_scrobbles.thr,
                  Fri: prev_daily_scrobbles.fri,
                  Sat: prev_daily_scrobbles.sat,
                  Sun: prev_daily_scrobbles.sun,
                },
              }
            ],
          };
          
          
          const chart_1_config = {
            type: "bar",
            data: chart_1_data,
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: [`Listening Week [Scrobbles]`]
                }
              }
            },
          };
          chart_one = new Chart(chart_1_el, chart_1_config);
         }
      });
      
     }
  });


       
  
  
  $.ajax({
    url: `/duration/${period}/${offset}`,
    success: res => {
      let hour = parseInt(res.results[0].time_played.split(":")[0]);
      $("#week_hours").html(hour);
    }
  });
  $.ajax({
    url: `/duration/${period}/${offset + 1}`,
    success: resd => {
      let hour = parseInt(resd.results[0].time_played.split(":")[0]);
      $("#prev_week_hours").html(hour);
    }
  })
}






const chart_2_data = {
  datasets: [
    {
      label: "Scrobbles",
      backgroundColor: "#191414",
      data: {
        '4 May - 11 May': 304,
        '12 May - 20 May': 440,
        '20 May - 27 May': 543,
        '28 May - 5 June': 325,
      },
    },
  ],
};



const chart_2_config = {
  type: "bar",
  data: chart_2_data,
  options: {
    responsive: true,
  },
};


daily_plays(dOffset, period);
var chart_two = new Chart(chart_2_el, chart_2_config);
