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

var chart_1_el = document.getElementById("chart-1");
var chart_2_el = document.getElementById("chart-2");
var chart_one;

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

let daily_scrobbles = {
  mon: 0,
  tue: 0,
  wed: 0,
  thr: 0,
  fri: 0,
  sat: 0,
  sun: 0
}


let dOffset = 1;
const daily_plays = offset => {
  if (chart_one)
    chart_one.destroy();
  $.ajax({
    url: `/tracksplayed/week/${offset}`,
    success: (res) => {
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
      
      const chart_1_data = {
        datasets: [
          {
            label: "Scrobbles",
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
        ],
      };
      
      const chart_1_config = {
        type: "bar",
        data: chart_1_data,
        options: {
          responsive: true,
        },
      };
      $("#week_scrobbles").html(res.results.length);
      chart_one = new Chart(chart_1_el, chart_1_config);

    }
  });
  $.ajax({
    url: `/duration/week/${offset}`,
    success: res => {
      let hour = res.results[0].time_played.split(":")[0];
      console.log(hour);
      $("#week_hours").html(hour);
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


daily_plays(dOffset);
var chart_two = new Chart(chart_2_el, chart_2_config);
