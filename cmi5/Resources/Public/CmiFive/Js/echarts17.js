function echarts17_(event, container, page, temp) {
  //if (page == 0) document.getElementById("exampleModalLabel").innerHTML = event.srcElement.innerHTML;
  let data = getStatementsSelection("completed", page, temp);
  echartSetup(container, data, temp);
}

// function: LRS query on result of poll of H5P interaction at page "page"
function getStatementsSelection(verb, page, temp) {
  if (cmi5Controller[temp]) return;
  let sel = new ADL.Collection(
      getDashboardStatements(cmi5Controller.activityId, true, true)
    ),
    h5pObjectIdAndPage = handleStates.getH5pObjectIdAndPage(page),
    choicesV = [],
    //actor = getActorInBrowseMode(),
    sel2 = JSON.parse(JSON.stringify(sel.contents));
  sel2 = new ADL.Collection(sel2);
  h5pObjectIdAndPage =
    cmi5Controller.activityId +
    "/parentid/" +
    location.hostname +
    h5pObjectIdAndPage[1] +
    "/";
  sessionStorage.removeItem("h5ppage");
  sel.where(
    "actor.account != 'undefined' and verb.id = 'http://adlnet.gov/expapi/verbs/" +
      verb +
      "' and context.contextActivities.parent.0.id = '" +
      h5pObjectIdAndPage +
      "' and actor.account.name = '" +
      cmi5Controller.agent.account.name +
      "'"
  );
  sel2
    .where(
      "actor.account != 'undefined' and verb.id = 'http://adlnet.gov/expapi/verbs/" +
        verb +
        "' and context.contextActivities.parent.0.id = '" +
        h5pObjectIdAndPage +
        "' and actor.account.name != '" +
        cmi5Controller.agent.account.name +
        "'"
    )
    .groupBy("context.extensions[https://h5p.org/previous-state]")
    .select("group as ratings");
  sel = sel.contents[0];
  sel2 = sel2.contents;
  if (!sel.context.extensions["https://h5p.org/previous-state"]) return;
  let ratings = JSON.parse(
      sel.context.extensions["https://h5p.org/previous-state"]
    ),
    questions = JSON.parse(sel.context.extensions["https://h5p.org/questions"]),
    ps = [],
    ratingsX = [];
  for (let i = 0; i < ratings.length; i++) {
    if (!ratings[i]) ratings[i] = 0;
    choicesV.push({
      name: questions[i],
      value: parseInt(ratings[i]) + 1
    });
  }
  for (let i = 0; i < sel2.length; i++) {
    ps[i] = JSON.parse(sel2[i].ratings);
    for (let ii = 0; ii < ps[i].length; ii++) {
      if (!ratingsX[ii]) ratingsX[ii] = 0;
      ratingsX[ii] += (parseInt(ps[i][ii]) + 1) / sel2.length;
      ratingsX[ii] = Math.round(ratingsX[ii] * 10) / 10;
    }
  }

  //cmi5Controller[temp] = choicesV;
  return {
    choicesV: choicesV,
    ratingsX: ratingsX
  };
}

function echartSetup(container, data_, temp) {
  if (cmi5Controller[temp]) data_ = cmi5Controller[temp];
  if (!data_) return;
  if (document.getElementById(container))
    container = document.getElementById(container);
  let myChart = echarts.init(container),
    option,
    data = data_.choicesV,
    datax = [],
    datay = [],
    series = [];
  for (let i = 0; i < data.length; i++) {
    datax.push(data[i].name);
    datay.push(data[i].value);
  }
  series.push({
    name: "Bewertung von mir",
    barGap: 0,
    barWidth: "25%",
    data: datay,
    type: "bar",
    axisLabel: {
      show: false
    },
    label: {
      show: false
    },
    emphasis: {
      focus: "series"
    },
    itemStyle: {
      normal: {
        color: "#fac858"
      }
    }
  });
  series.push({
    name: "Bewertung von anderen",
    data: data_.ratingsX,
    barWidth: "25%",
    type: "bar",
    axisLabel: {
      show: false
    },
    label: {
      show: false
    },
    emphasis: {
      focus: "series"
    },
    itemStyle: {
      normal: {
        color: "#5470c6"
      }
    }
  });
  let title = "Welche Erfahrungen haben Sie mit Übergängen gemacht?",
    subtext =
      "Ihre Bewertungen mit 1 - 3 Sternen. Rechts daneben sehen Sie die durchschnittliche Berwertung von anderen Teilnehmern zum Vergleich.";
  if (cmi5Controller.ecTitle) title = cmi5Controller.ecTitle;

  option = {
    tooltip: {
      trigger: "axis"
    },
    title: {
      text: title,
      subtext: subtext,
      left: "8%"
    },
    legend: {
      orient: "vertical",
      left: "75%",
      top: "0%",
      type: "scroll"
    },
    xAxis: {
      type: "category",
      data: datax,
      axisLabel: {
        show: false
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        //formatter: "{value} %"
      }
    },
    series: series
  };

  if (option && typeof option === "object") myChart.setOption(option);
  if (document.querySelector(".spinner-border"))
    document.querySelector(".spinner-border").style.display = "none";
  window.addEventListener("resize", function (event) {
    myChart.resize();
  });
}
