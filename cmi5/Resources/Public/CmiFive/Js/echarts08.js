function echarts08_(event, container, page, activityId, mode, vObj) {
  const data = getStatementsSelection("ended", page, activityId);
  if (typeof data !== "undefined") echartSetup(container, data, mode, vObj);
  else {
    userAlerts("nodatamodal");
    return;
  }
}
// function: LRS query on video statements
function getStatementsSelection(verb, page, activityId) {
  let videoActivityIds = [],
    dashboardDataS = [],
    dashboardDataD = [],
    dashboardDataT = [],
    dashboardDataC = [],
    stmtsCached = false;

  // get videoActivityIds from sessionStorage
  if (activityId)
    videoActivityIds.push(
      JSON.parse(sessionStorage.getItem("stmtObject")).id +
        "/objectid/" +
        activityId.substring(8, activityId.length)
    );
  else {
    for (let i = 0; i < sessionStorage.length; i++) {
      if (sessionStorage.key(i).includes("video___")) {
        videoActivityIds.push(
          JSON.parse(sessionStorage.getItem("stmtObject")).id +
            "/objectid/" +
            sessionStorage.key(i).substring(8, sessionStorage.key(i).length)
        );
      }
    }
  }

  // get statements from cached statements object including releated activities
  if (sessionStorage.getItem("stmtsCached") === "true") stmtsCached = true;
  let stmts = getDashboardStatements(
      cmi5Controller.activityId,
      //stmtsCached, // cache
      true, // relatedactivities
      true // relatedagents
    ),
    actor = getActorInBrowseMode();
  // prepare selection of suitable data
  for (let v = 0; v < videoActivityIds.length; v++) {
    let sel = new ADL.Collection(stmts);
    sel
      .where(
        "actor.account != 'undefined' and object.id = '" +
          videoActivityIds[v] +
          "' and result.extensions[https://w3id.org/xapi/video/extensions/current-time] > 0 and verb.id = 'https://w3id.org/xapi/video/verbs/" +
          verb +
          actor +
          "'"
      )
      .groupBy("actor.account.name")
      .count(
        "result.extensions[https://w3id.org/xapi/video/extensions/progress]"
      );
    sel = sel.contents;
    let segments = [],
      duration,
      title,
      cid;
    if (sel[0].data.length > 0) {
      // get duration, content id, video title and played segments for each video from latest video statement
      if (
        typeof sel[sel.length - 1].data[sel[sel.length - 1].count - 1].result
          .extensions["https://w3id.org/xapi/video/extensions/duration"] !==
        undefined
      )
        duration =
          sel[sel.length - 1].data[sel[sel.length - 1].count - 1].result
            .extensions["https://w3id.org/xapi/video/extensions/duration"];
      for (let i = 0; i < sel.length; i++) {
        if (
          typeof sel[i].data[sel[i].count - 1].context.extensions[
            "https://w3id.org/xapi/video/extensions/cid"
          ] !== undefined
        )
          cid =
            sel[i].data[sel[i].count - 1].context.extensions[
              "https://w3id.org/xapi/video/extensions/cid"
            ];

        if (
          typeof sel[i].data[sel[i].count - 1].context.extensions[
            "https://w3id.org/xapi/video/extensions/title"
          ] !== undefined
        )
          title =
            sel[i].data[sel[i].count - 1].context.extensions[
              "https://w3id.org/xapi/video/extensions/title"
            ];

        if (
          sel[i].data[sel[i].count - 1].result.extensions[
            "https://w3id.org/xapi/video/extensions/played-segments"
          ] !== undefined
        )
          segments.push(
            JSON.parse(
              sel[i].data[sel[i].count - 1].result.extensions[
                "https://w3id.org/xapi/video/extensions/played-segments"
              ]
            )
          );
      }
      dashboardDataS.push(segments);
      dashboardDataD.push(duration);
      dashboardDataT.push(title);
      dashboardDataC.push({ [videoActivityIds[v]]: cid });
    }
  }
  return {
    dashboardDataS: dashboardDataS,
    dashboardDataD: dashboardDataD,
    dashboardDataT: dashboardDataT,
    dashboardDataC: dashboardDataC,
    videoActivityIds: videoActivityIds
  };
}
function echartSetup(container, data_, mode, vObj) {
  if (document.getElementById(container))
    container = document.getElementById(container);
  if (sessionStorage.getItem("cmi5No") === "false") {
    var myChart = echarts.init(container, mode);
    var seriesData_ = [],
      xAxis = [],
      yAxis = [],
      legend = [],
      grid = [],
      title = [],
      ids = [],
      cids = [];
    function secToMmss(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${String(minutes).padStart(1, "0")}:${String(
        remainingSeconds
      ).padStart(2, "0")}`;
    }
    for (let v = 0; v < data_.dashboardDataS.length; v++) {
      let seriesData = [],
        userSegments = [],
        xAxisData = [],
        segementsData = data_.dashboardDataS[v],
        videoLength = data_.dashboardDataD[v],
        videoName = data_.dashboardDataT[v],
        cid = data_.dashboardDataC[v][data_.videoActivityIds[v]];

      for (let i = 0; i < segementsData.length; i++) {
        ids.push(data_.videoActivityIds[v]);
        cids.push(cid);
        userSegments.push({
          user: "User " + (i + 1),
          segments: segementsData[i]
        });
      }

      legend = { data: [...new Set(userSegments.map(({ user }) => user))] };
      if (mode === "dark") {
        title.push({
          top: "8%",
          left: "3.25%",
          textStyle: { fontSize: 12, fontWeight: "normal" },
          text: "Video: " + videoName
        });
        grid.push({
          left: "5%",
          top: "20%",
          width: "85%",
          height: "65%"
        });
      } else {
        title.push({
          top: v * 32 + 6 + "%",
          left: "3.25%",
          textStyle: { fontSize: 12, fontWeight: "normal" },
          text: "Video: " + videoName
        });
        grid.push({
          left: "5%",
          top: v * 32 + 12 + "%",
          width: "85%",
          height: 60 / data_.dashboardDataS.length + "%"
        });
      }
      xAxisData = Array.from(
        { length: Math.ceil(videoLength / 1) },
        (_, i) => i * 1
      );

      xAxis.push({
        type: "category",
        data: xAxisData,
        gridIndex: v,
        name: "Timecode",
        axisLabel: {
          formatter: function (seconds, index) {
            return secToMmss(seconds);
          }
        }
      });
      yAxis.push({
        type: "value",
        gridIndex: v
      });
      seriesData = userSegments.map(({ user, segments }) => ({
        xAxisIndex: v,
        yAxisIndex: v,
        //barGap: 0,
        //color: ["red", "blue", "green", "yellow", "brown"],
        //barWidth: "100%",
        //stack: "Usage" + v,
        name: user,
        type: "bar",
        itemStyle: {
          //color: colorList[v]
        },
        data: xAxisData.map((timestamp) => {
          const timeInterval = [timestamp, timestamp + 1];
          const totalViewedTime = segments.reduce((total, segment) => {
            const intersection =
              Math.min(timeInterval[1], segment.t2) -
              Math.max(timeInterval[0], segment.t1);
            return total + Math.max(0, intersection);
          }, 0);
          if (totalViewedTime > 0) return totalViewedTime;
          else return null;
        })
      }));
      for (let s = 0; s < seriesData.length; s++) {
        seriesData[s].data[0] = seriesData[s].data[1];
        seriesData_.push(seriesData[s]);
      }
    }
    const options = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        },
        renderMode: "html",
        className: "echarts-tooltip",
        formatter: function (params) {
          let timecode = secToMmss(params[0].dataIndex);
          let tooltip =
            "<div class='dataIndex' style='display: none'>" +
            params[0].dataIndex +
            "</div>" +
            "<div class='timecode'>Timecode <span style='font-weight: bold;'>" +
            timecode +
            "</span></div>";
          for (let i = 0; i < params.length; i++) {
            if (params[i].data > 0) {
              tooltip +=
                "<div>" +
                params[i].seriesName +
                ": <span style='font-weight: bold;'>" +
                params[i].data +
                " x besichtigt</span></div>";
            }
          }
          tooltip +=
            "<div style='margin-top: 20px; font-weight:bold;'>Klick um an die Stelle<br>im Video zu springen!</div>";
          return tooltip;
        }
      },
      toolbox: {
        show: true,
        feature: {
          restore: {},
          saveAsImage: {}
        }
      },
      grid: grid,
      legend: legend,
      title: title,
      xAxis: xAxis,
      yAxis: yAxis,
      graphic: [
        {
          type: "group",
          right: 64,
          top: 1,
          children: [
            {
              type: "rect",
              z: 100,
              left: "center",
              top: "middle",
              shape: {
                width: 150,
                height: 24
              },
              style: {
                fill: "#eee",
                stroke: "#555",
                lineWidth: 1,
                shadowBlur: 8,
                shadowOffsetX: 3,
                shadowOffsetY: 3,
                shadowColor: "rgba(0,0,0,0.2)"
              }
            },
            {
              type: "text",
              z: 100,
              left: "center",
              top: "middle",
              style: {
                fill: "#333",
                width: 180,
                overflow: "break",
                text: "Summe alle User",
                font: "14px Calibri"
              }
            }
          ]
        }
      ],
      series: seriesData_
    };

    if (options && typeof options === "object") myChart.setOption(options);

    var click;
    myChart.on("click", function (params) {
      let id_ = ids[params.seriesIndex],
        cid_ = cids[params.seriesIndex];
      if (mode === "dark") cid_ = sessionStorage.getItem("cid");
      if (typeof id_ !== "undefined")
        videoControl(vObj, id_, cid_, params.dataIndex);
      var option = this.getOption();
      if (params.componentType === "graphic") {
        if (click) {
          for (let i = 0; i < option.series.length; i++) {
            delete option.series[i].stack;
            //option.color = colorList;
            option.color = [
              "#5470c6",
              "#91cc75",
              "#fac858",
              "#ee6666",
              "#73c0de",
              "#3ba272",
              "#fc8452",
              "#9a60b4",
              "#ea7ccc"
            ];
          }
          click = false;
        } else {
          let col,
            black = [
              "black",
              "black",
              "black",
              "black",
              "black",
              "black",
              "black",
              "black",
              "black"
            ],
            white = [
              "white",
              "white",
              "white",
              "white",
              "white",
              "white",
              "white",
              "white",
              "white"
            ];
          if (mode === "dark") col = white;
          else col = black;
          for (let i = 0; i < option.series.length; i++) {
            option.series[i].stack = "Video " + option.series[i].xAxisIndex;
            option.color = col;
          }
          click = true;
        }
        this.setOption(
          { series: option.series, color: option.color },
          { replaceMerge: "series" }
        );
      }
    });
    myChart.getZr().on("click", function (event) {
      if (mode === "dark" && event.offsetY > 40) {
        let cid_ = sessionStorage.getItem("cid"),
          id_ = data_.videoActivityIds[0],
          d = document.querySelector(
            "#container_" + cid_ + " .echarts-tooltip .dataIndex"
          ).innerHTML;
        //.childNodes[0].childNodes[0].childNodes[0].innerHTML;
        if (typeof id_ !== "undefined") videoControl(vObj, id_, cid_, d);
      }
      //console.log(event);
    });
    function videoControl(vObj, id_, cid_, d) {
      if (id_.includes("vimeo")) {
        sessionStorage.setItem("vimeoCurrTime", d);
        if (vObj) {
          vObj.contentWindow.postMessage(
            {
              method: "setCurrentTime",
              value: sessionStorage.getItem("vimeoCurrTime")
            },
            "*"
          );
          vObj.contentWindow.postMessage(
            {
              method: "play",
              value: sessionStorage.getItem("vimeoCurrTime")
            },
            "*"
          );
        }
      } else if (id_.includes("youtube")) {
        sessionStorage.setItem("youtubeCurrTime", d);
        if (vObj)
          vObj.contentWindow.postMessage(
            JSON.stringify({
              event: "command",
              func: "seekTo",
              args: [sessionStorage.getItem("youtubeCurrTime"), true]
            }),
            "*"
          );
      } else {
        sessionStorage.setItem("videoCurrTime", d);
        if (vObj) {
          vObj.currentTime = sessionStorage.getItem("videoCurrTime");
          vObj.play();
        }
      }
      if (id_.includes("objectid/")) {
        xMouseDown = true;
        let path =
          "https://" +
          id_.substring(
            id_.indexOf("objectid/") + "objectid/".length,
            id_.indexOf("/https://")
          );
        location.href = path + "?" + constStates.cmi5Parms + "#" + cid_;
        document.querySelector("#canvasModal .btn-close").click();
      }
    }
    if (document.querySelector(".modal.show .spinner-border"))
      document.querySelector(".modal .spinner-border").classList.add("d-none");
    window.addEventListener("resize", function (event) {
      myChart.resize();
    });
  }
}
