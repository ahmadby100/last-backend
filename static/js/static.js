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
$(window).click(() => {
  $("#features").hide();
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

const chart_1_data = {
  datasets: [
    {
      label: "Scrobbles",
      backgroundColor: "#191414",
      data: {
        Monday: 10,
        Tuesday: 40,
        Wednesday: 54,
        Thursday: 32,
        Friday: 30,
        Saturday: 10,
        Sunday: 45,
      },
    },
  ],
};

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

const chart_1_config = {
  type: "bar",
  data: chart_1_data,
  options: {
    responsive: true,
  },
};

const chart_2_config = {
  type: "bar",
  data: chart_2_data,
  options: {
    responsive: true,
  },
};

var chart_1_el = document.getElementById("chart-1");
var chart_2_el = document.getElementById("chart-2");
var chart_one = new Chart(chart_1_el, chart_1_config);
var chart_two = new Chart(chart_2_el, chart_2_config);
