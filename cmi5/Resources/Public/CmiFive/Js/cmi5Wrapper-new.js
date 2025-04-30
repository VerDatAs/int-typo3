// Copyright 2024 Robert Kraemer
Storage.prototype.setObj = function (key, obj) {
  return this.setItem(key, LZString.compressToUTF16(JSON.stringify(obj)));
};
Storage.prototype.getObj = function (key) {
  return JSON.parse(LZString.decompressFromUTF16(this.getItem(key)));
};
var xMouseDown = false,
  ios = /iPad|iPhone|iPod/.test(navigator.userAgent),
  safari =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
  beforeUnloadListener,
  statesController,
  enableGoToPage = false,
  enableSpokenWord = false,
  enableVideoTracking = true,
  enableHighlighting = false,
  enableH5pEcharts = false,
  enableVideoEcharts = true,
  enableCanvasEdit = false,
  enableAuthorLA = false,
  enablePageCompleted = true,
  documentationtoolPreviousState = true,
  documentationtoolCid,
  mouseInside = false,
  handleStates,
  projectId,
  pColor,
  constStates = {},
  statementsCount = 2000,
  statesVar = "bookmarkingData"; //states
// send Terminated on close browser window/tab
beforeUnloadListener = function (event) {
  sessionStorage.setItem("persisted", JSON.stringify(event));
  if (
    !window.xUnload &&
    //!event.persisted &&
    !xMouseDown &&
    sessionStorage.getItem("statesInit")
  ) {
    window.xUnload = true;
    sessionStorage.setItem("terminated", "true");
    let sd = handleStates.getPageDuration(
      Number(sessionStorage.getItem("startTimeStamp"))
    );
    sendDefinedStatementWrapper("Terminated", "", sd);
  }
};
window.addEventListener("online", (event) => {
  swal.close();
});
window.addEventListener("offline", (event) => {
  userAlerts("nointernet");
});

// set event listener to send Terminated on close browser window/tab
if (ios) {
  /*lifecycle.addEventListener('statechange', function(event) {
    if (event.newState === "hidden") {
      beforeUnloadListener(event);
      userAlerts("golms");
    }
  });*/
  window.addEventListener("visibilitychange", (event) => {
    if (document.visibilityState === "hidden") {
      //beforeUnloadListener(event);
      //userAlerts("golms");
    }
  });
} else {
  window.addEventListener(
    "pagehide",
    (event) => {
      //beforeUnloadListener(event);
    },
    { once: true }
  );
}

if (
  sessionStorage.getItem("constStates") !== "[object Object]" &&
  sessionStorage.getItem("constStates")
)
  constStates = sessionStorage.getObj("constStates");

// add cmi5 parms to URL if applicable
if (
  location.href.indexOf("endpoint") === -1 &&
  parseInt(sessionStorage.getItem("courseLoggedIn")) > 0
) {
  window.history.replaceState(null, null, "?" + constStates.cmi5Parms);
}
// prevent browser navigation
history.pushState(null, null, location.href);

window.top.addEventListener("popstate", () => {
  if (!xMouseDown) {
    history.go(1);
    if (document.querySelector(".sandbox.start")) userAlerts("start");
    else if (!mouseInside) userAlerts("prevnext");
  }
});


// function: init, set/get, handle xapi states
statesController = function () {
  this.pagesVisited = [];
  this.attemptDuration = 0;
  this.completed = false;
  this.pagesTotal = 0;
  this.failed = false;
  this.passed = false;
  this.passedOrFailed = false;
  this.pageTitle = "";
  this.progress = 0;
  this.hls = [];
  this.videos = [];
  this.durations = [];
  this.h5pStates = [];
  this.h5pObjectIdAndPage = [];
};

statesController.prototype = {
  initStates: function (states) {
    this.pagesVisited = states.pagesVisited;
    this.attemptDuration = states.attemptDuration;
    this.pagesTotal = states.pagesTotal;
    this.completed = states.completed;
    this.failed = states.failed;
    this.passed = states.passed;
    this.passedOrFailed = states.passedOrFailed;
    this.hls = states.hls;
    this.videos = states.videos;
    this.durations = states.durations;
    this.h5pStates = states.h5pStates;
    this.h5pObjectIdAndPage = states.h5pObjectIdAndPage;
  },
  // function: get total duration of all attempts of AU
  getAttemptDuration: function () {
    let ad = 0,
      pds = [];
    if (sessionStorage.getItem("pageDurations"))
      pds = JSON.parse(sessionStorage.getItem("pageDurations"));
    if (pds && pds.length > 0) {
      for (let i = 0; i < pds.length; i++) {
        ad = moment
          .duration(this.attemptDuration)
          .add(this.getPageDuration(pds[i]));
      }
    } else {
      ad = this.getPageDuration(
        Number(sessionStorage.getItem("startTimeStamp"))
      );
      ad = moment.duration(this.attemptDuration).add(ad);
    }
    this.attemptDuration = ad;
    pds.push(Date.now());
    sessionStorage.setItem("pageDurations", JSON.stringify(pds));
    sessionStorage.setItem("attemptDuration", this.attemptDuration);
  },
  // function: get duration of current page visited
  getPageDuration: function (start) {
    let d = moment(Date.now());
    return moment.duration(d.diff(start), "ms").toISOString();
  },
  // function: load state values from LRS
  getStates: function (launchedSessions, markMenuItemsCb) {
    // get state data on init session ...
    let states = [];
    if (sessionStorage.getItem("statesInit")) {
      // ... get state data from sessionStorage during session
      if (constStates.pagesTotal) states.pagesTotal = constStates.pagesTotal;

      if (sessionStorage.getItem("completed"))
        states.completed = sessionStorage.getItem("completed");

      if (sessionStorage.getItem("passed"))
        states.passed = sessionStorage.getItem("passed");

      if (sessionStorage.getItem("passedOrFailed"))
        states.passedOrFailed = sessionStorage.getItem("passedOrFailed");

      if (sessionStorage.getItem("failed"))
        states.failed = sessionStorage.getItem("failed");

      if (sessionStorage.getItem("attemptDuration"))
        states.attemptDuration = sessionStorage.getItem("attemptDuration");
      // set DocumentationTool to page of current "Schritt"
      if (sessionStorage.getItem("h5p-state___/h5pcid_" + documentationtoolCid) && projectId === "spi") {
        let ps = JSON.parse(
          sessionStorage.getItem("h5p-state___/h5pcid_" + documentationtoolCid)
        );
        if (sessionStorage.getItem("schrittnr") && ps) ps.previousPage = parseInt(sessionStorage.getItem("schrittnr"));
        sessionStorage.setItem(
          "h5p-state___/h5pcid_" + documentationtoolCid,
          JSON.stringify(ps)
        );
      }
    } else {
      // ... handle state data
      sessionStorage.setItem("startTimeStamp", Date.now());
      // check moveOn..
      let initializedSessions = this.getStatementsBase(
        "initialized",
        cmi5Controller.agent.account,
        "",
        cmi5Controller.registration
      );
      let abandonedSessions = this.getStatementsBase(
        "abandoned",
        cmi5Controller.agent.account,
        "",
        cmi5Controller.registration
      );
      // create empty state data in LRS on init
      if (launchedSessions.length < 2 || initializedSessions.length < 1) {
        //cmi5Controller.sendAllowedState("statements", {});
        //cmi5Controller.sendAllowedState(statesVar, {});
      }
      // get state data from LRS
      else {
        states = cmi5Controller.getAllowedState(statesVar);
        if (!sessionStorage.getItem("statements")) {
          var statementsB64 = cmi5Controller.getAllowedState(
            "statements",
            initializedSessions[initializedSessions.length - 1].timestamp
          );
          if (
            typeof statementsB64 !== "object" &&
            !Array.isArray(statementsB64) &&
            statementsB64 !== null &&
            statementsB64.length > 4
          )
            sessionStorage.setObj(
              "statements",
              JSON.parse(LZString.decompressFromBase64(statementsB64))
            );
        }
        if (states && states.completed && states.completed === "true") {
          sessionStorage.setItem("satisfied", true);
          sessionStorage.setItem("completed", true);
        }
        let satisfiedSession = this.getStatementsBase(
          "satisfied",
          cmi5Controller.agent.account,
          "",
          cmi5Controller.registration
        );

        if (abandonedSessions.length > 0) {
          for (let i = 1; i < 6; i++) {
            if (
              moment(
                abandonedSessions[abandonedSessions.length - 1].timestamp
              ).format("YYYY-MM-DD HH:mm:ss") ===
              moment(
                launchedSessions[launchedSessions.length - i].timestamp
              ).format("YYYY-MM-DD HH:mm:ss")
            ) {
              userAlerts("abandoned");
              break;
            }
          }
        }
        if (satisfiedSession.length > 0) {
          sessionStorage.setItem("satisfied", true);
        }
      }
      if (projectId === "spi") {
        setTimeout(() => {
          if (documentationtoolPreviousState) {
            let documentationtoolPs = this.getStatementsBase(
              "",
              cmi5Controller.agent.account,
              "https://ilias.de/cmi5/activityid/objectid/" + location.hostname + "/h5pcid_" + documentationtoolCid,
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              true
            );
            if (documentationtoolPs.length > 0) {
              let ps = JSON.parse(
                documentationtoolPs[documentationtoolPs.length - 1].context
                  .extensions[
                  "https://h5p.org/documentationtool" + documentationtoolCid
                ]
              );
              // set DocumentationTool to page of current "Schritt"
              ps.previousPage = parseInt(sessionStorage.getItem("schrittnr"));
              sessionStorage.setItem(
                "h5p-state___/h5pcid_" + documentationtoolCid,
                JSON.stringify(ps)
              );
            }
          }
        }, 600);
      }
    }
    console.log("launchMode set to: " + constStates.launchMode);
    // add class launchMode to body - if launchMode is browse show component IDs
    let browseMode = "normal";
    if (enableAuthorLA) browseMode = "browse";
    document
      .querySelector("body")
      .classList.add("cmi5-" + browseMode);
    if (document.querySelector("body.cmi5-browse")) {
      var cmi5Browse = document.querySelectorAll("body .browse");
      for (let i = 0; i < cmi5Browse.length; i++) {
        cmi5Browse[i].parentElement.addEventListener("mouseout", function () {
          cmi5Browse[i].classList.add("d-none");
        });
        cmi5Browse[i].parentElement.addEventListener("mouseover", function () {
          cmi5Browse[i].classList.remove("d-none");
        });
      }
    }
    // load highlighted text at relevant pages to sessionStorage
    if (!enableHighlighting && states && states.hls) delete states.hls;
    // delete states.h5pStates;
    if (sessionStorage.getItem("pagesVisited"))
      states.pagesVisited = JSON.parse(sessionStorage.getItem("pagesVisited"));

    if (enableHighlighting && states && states.hls)
      textHightlighting("", "", "", states.hls);

    if (states && states.videos)
      storeVisitedSegments("", "", "", states.videos, states.durations);

    if (states && states.h5pStates) h5pState(states.h5pStates);
    if (states && states.h5pObjectIdAndPage)
      h5pObjectIdAndPage(states.h5pObjectIdAndPage);
    if (states && typeof states.pagesVisited !== "undefined")
      // populate object of states data
      this.initStates(states);

    // resume dialog beyond first entry
    if (!sessionStorage.getItem("statesInit") && this.pagesVisited.length > 0)
      this.resumeDialog(); //&& !sessionStorage.getItem("goToPage"))
    else if (document.querySelector("#site-preloader")) sitePreloader("hide");

    markMenuItemsCb(handleStates.setStates);
  },
  // function: save state values to LRS
  setStates: function () {
    let states, thl, vvs, h5ps;
    handleStates.getAttemptDuration();
    sessionStorage.setItem(
      "pagesVisited",
      JSON.stringify(handleStates.pagesVisited)
    );

    if (sessionStorage.getItem("completed")) this.completed = true;
    if (sessionStorage.getItem("failed")) this.failed = true;
    if (sessionStorage.getItem("passed")) this.passed = true;
    if (sessionStorage.getItem("passedOrFailed")) this.passedOrFailed = true;

    // save states data to LRS
    vvs = storeVisitedSegments();
    thl = textHightlighting(
      document.getElementById("page-content"),
      document.querySelector(".navbar .notes-au-button"),
      true
    );
    h5ps = h5pState();
    h5po = h5pObjectIdAndPage();
    states = {
      pagesVisited: handleStates.pagesVisited,
      attemptDuration: sessionStorage.getItem("attemptDuration"),
      pagesTotal: constStates.pagesTotal,
      completed: sessionStorage.getItem("completed"),
      failed: sessionStorage.getItem("failed"),
      passed: sessionStorage.getItem("passed"),
      passedOrFailed: sessionStorage.getItem("passedOrFailed"),
      hls: thl,
      videos: vvs.videos,
      durations: vvs.durations,
      h5pStates: h5ps,
      h5pObjectIdAndPage: h5po
    };
    if (cmi5Controller) {
      cmi5Controller.sendAllowedState(statesVar, states);
      if (!sessionStorage.getItem("statements")) {
        cmi5Controller.sendAllowedState(
          "statements",
          LZString.compressToBase64(
            LZString.decompressFromUTF16(sessionStorage.getItem("statements"))
          )
        );
      }
    }
  },
  // function: follow up on resume dialog...
  resumeDialog: function () {
    sendAllowedStatementWrapper("Resumed");
    document.querySelector(".btn.resume-dialog").click();
    setTimeout(() => {
      sitePreloader("hide");
    }, 600);
  },
  // function: go to page bookmarked in LRS when resume course
  goToBookmarkedPage: function () {
    if (this.pagesVisited.length > 0)
      location.href = this.pagesVisited[0].substring(
        0,
        this.pagesVisited[0].indexOf("__vp__")
      );
  },
  // function: get index of current page in pagesVisited
  getCurrentPage: function (pagesVisited, currentPage, attr) {
    for (let i = 0; i < pagesVisited.length; i++) {
      if (pagesVisited[i].substring(0, pagesVisited[i].indexOf("__vp__")) === currentPage) return i;
    }
    return -1;
  },
  // function: check moveon criteria and send relevant statement
  checkMoveOn: function (moveOn, finish) {
    let masteryScore = 100;
    if (cmi5Controller.masteryScore)
      masteryScore = cmi5Controller.masteryScore * 100;
    if (moveOn === "NotApplicable") moveOn = "Completed";
    if (constStates.pagesTotal) this.pagesTotal = constStates.pagesTotal;
    function moveOnPassed() {
      if (sessionStorage.getItem("passed")) {
        sendDefinedStatementWrapper(
          "Passed",
          parseFloat(sessionStorage.getItem("score")),
          handleStates.attemptDuration
        );
      } else if (sessionStorage.getItem("failed")) {
        sendDefinedStatementWrapper(
          "Failed",
          parseFloat(sessionStorage.getItem("score")),
          handleStates.attemptDuration
        );
      }
    }
    // function: send statement "completed" if number of visited pages is greater than cmi5 mastery score (for example "0.8"), there may be other conditions for completion, like score achieved in assessment etc.
    function moveOnCompleted() {
      if (handleStates.progress >= masteryScore) {
        // send statement "completed", but only once!
        sendDefinedStatementWrapper(
          "Completed",
          "",
          handleStates.attemptDuration
        );
        sessionStorage.setItem("satisfied", true);
        sessionStorage.setItem("completed", true);
      }
    }

    if (this.pagesTotal > 0) {
      if (!sessionStorage.getItem("satisfied")) {
        switch (moveOn.toUpperCase()) {
          case "PASSED":
            moveOnPassed();
            break;
          case "COMPLETED":
            moveOnCompleted();
            break;
          case "COMPLETEDANDPASSED":
            moveOnPassed();
            moveOnCompleted();
            break;
          case "COMPLETEDORPASSED":
            moveOnPassed();
            moveOnCompleted();
            break;
        }
      }
      if (this.progress && !finish) {
        sendAllowedStatementWrapper(
          "Progressed",
          "",
          this.getPageDuration(Number(sessionStorage.getItem("startTimeStamp"))),
          //Date.now() - cmi5Controller.getStartDateTime(),
          this.progress
        );
      }
    }
  },
  // function: indicate relevant menu items in t3 menu as visited, set current progress in progressbar
  markMenuItems: function (setStatesCb) {
    const mItemsTotal = document.querySelectorAll(".main-navbarnav a[target=_self]");
    const dItemsTotal = document.querySelectorAll(".main-navbarnav .nav-item > a");
    const offcanvasProgressbar = document.querySelector(".offcanvas .progress-bar");
    const offcanvasProgress = document.querySelector(".offcanvas .progress");
    const pageId = document.body.id;
    const mItems = [];
    // when navbar is visible, track pages visited and display progress on current page
    if (document.querySelector("#main-navbar")) {
      const pageProgressBar = document.querySelector(".page-progress-bar");
      const body = document.body;
      const lp = location.pathname;
      let p = [(window.innerHeight / body.scrollHeight) * 100, 0];
      let lpx;
      const indexOfCurrentPageInPagesVisited = handleStates.getCurrentPage(handleStates.pagesVisited, lp);
      // Retrieve pagesVisited from sessionStorage if it exists
      if (sessionStorage.getItem("pagesVisited")) {
        handleStates.pagesVisited = JSON.parse(sessionStorage.getItem("pagesVisited"));
      }
      // Find if current page is already in pagesVisited and get its progress
      for (let i = handleStates.pagesVisited.length - 1; i >= 0; i--) {
        const visitedPage = handleStates.pagesVisited[i];
        const visitedPagePath = visitedPage.substring(0, visitedPage.indexOf("__vp__"));
        if (visitedPagePath === lp) {
          lpx = i;
          p[0] = parseFloat(visitedPage.substring(visitedPage.indexOf("__vp__") + 6));
          handleStates.pagesVisited.splice(i, 1);
          break;
        }
      }
      // Update the page progress bar width
      if (lpx !== undefined && pageProgressBar) {
        p[0] = Math.min(p[0], 100);
        pageProgressBar.style.width = `${p[0]}%`;
      } else if (pageProgressBar) {
        const initialProgress = (window.innerHeight / body.scrollHeight) * 100;
        pageProgressBar.style.width = `${initialProgress}%`;
      }
      // Update pagesVisited array
      if (indexOfCurrentPageInPagesVisited < 0 && !sessionStorage.getItem("statesInit")) {
        handleStates.pagesVisited.push(`${lp}__vp__${p[0]}`);
      } else if (!lp.includes("glossar")) {
        // Remove current page from pagesVisited if visited before and add it to the top
        handleStates.pagesVisited.unshift(`${lp}__vp__${p[0]}`);
      }
      // Initialize cumulative progress value
      let cpv = 0;
      if (offcanvasProgressbar) {
        for (let i = 0; i < handleStates.pagesVisited.length; i++) {
          cpv += parseFloat(handleStates.pagesVisited[i].substring(handleStates.pagesVisited[i].indexOf("__vp__") + 6)) / 100;
        }
        // set current progress in progressbar or set progress to 100% on last page
        handleStates.progress = parseInt(((cpv + 1) / mItemsTotal.length) * 100);
        if ((getCurrentPageIndex() === constStates.pagesTotal - 2 && handleStates.progress > 80) || handleStates.progress > 100) handleStates.progress = 100;
        offcanvasProgress.insertAdjacentHTML(
          "afterend",
          "<div class='progress-bar-value'>25%</div>"
        );

        offcanvasProgressbar.style.width = `${handleStates.progress}%`;
        const progressBarValue = document.querySelector(
          ".offcanvas .progress-bar-value"
        );
        progressBarValue.textContent = `${handleStates.progress}% bearbeitet`;
      }
      document.addEventListener("scroll", () => {
        // Save the current scroll position
        sessionStorage.setItem("scrollpos", window.scrollY);
      
        // Calculate the percentage of the page that has been scrolled
        const scrollPercentage =
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
        // Update progress if the new scroll percentage is greater than the previous
        if (p[0] < scrollPercentage) {
          // Update the progress array
          p.push(scrollPercentage);
          if (p[2] > 100) p[2] = 100;
      
          // Update the page progress bar width
          const pageProgressBar = document.querySelector(".page-progress-bar");
          if (pageProgressBar) {
            pageProgressBar.style.width = `${p[2]}%`;
          }
      
          // Update the visited pages with the new progress
          handleStates.pagesVisited[0] = `${lp}__vp__${p[2]}`;
          sessionStorage.setItem(
            "pagesVisited",
            JSON.stringify(handleStates.pagesVisited)
          );
      
          // Remove the oldest progress entry
          p.shift();
      
          // Calculate cumulative progress value
          let cumulativeProgress = 0;
          const pagesVisited = handleStates.pagesVisited;
          pagesVisited.forEach((page) => {
            const progressValue = parseFloat(
              page.substring(page.indexOf("__vp__") + 6)
            );
            cumulativeProgress += progressValue / 100;
          });
      
          // Update overall progress
          if (handleStates.progress < 100) {
            handleStates.progress = Math.min(
              parseInt(((cumulativeProgress + 1) / mItemsTotal.length) * 100),
              100
            );
          }
      
          // Update the offcanvas progress bar if it exists
          if (offcanvasProgressbar) {
            offcanvasProgressbar.style.width = `${handleStates.progress}%`;
            const progressBarValue = document.querySelector(
              ".offcanvas .progress-bar-value"
            );
            progressBarValue.textContent = `${handleStates.progress}% bearbeitet`;
          }
        }
      });
    }

    setTimeout(() => {
      if (
        document.querySelectorAll(".dpnglossary.link").length > 0 &&
        sessionStorage.getItem("scrollLatest")
      ) {
        window.scrollTo({
          top: parseFloat(sessionStorage.getItem("scrollLatest")),
          behavior: "smooth",
        });
        sessionStorage.removeItem("scrollLatest");
      }
    }, 600);
    // Indicate relevant menu items in the menu as visited and add progress circles
    if (sessionStorage.getItem("statesInit") && constStates.startPageId !== pageId) {
      // Set progress circles to pages in menu items
      mItemsTotal.forEach((mItemI, i) => {
        // Get total number of pages
        if (!constStates.pagesTotal) mItems.push(mItemI);
        // Highlight current page menu item and add checkmark
        if (mItemI.classList.contains("active")) {
          mItemI.classList.add("visited");
          handleStates.pageTitle = mItemI.textContent.trim();
          // Show page-link unless it's the last page
          if (i < mItemsTotal.length - 1) {
            const pagePagination = document.querySelector(".page-pagination");
            if (pagePagination) {
              pagePagination.style.display = "block";
            }
          }
        }
        // Set progress circles to menu items of pages
        if (!mItemI.parentNode.classList.contains("nav-item")) {
          // Normalize both URLs
          const menuItemPath = normalizeUrl(mItemI.href);
          const currentPath = normalizeUrl(location.pathname);
          // Compare normalized paths
          if (menuItemPath === currentPath) {
            sessionStorage.setItem("mItemCurrentPage", mItemI.classList);
          }
          // Insert default progress circle with zero progress
          mItemI.insertAdjacentHTML(
            "afterbegin",
            createProgressCircle("transparent", 0, 0, 0.3, '', pColor)
          );
          handleStates.pagesVisited.forEach((visitedPage) => {
            // Extract the page URL before the '__vp__' part
            const visitedPageUrl = visitedPage.split("__vp__")[0];
            const visitedPagePath = normalizeUrl(visitedPageUrl);
            if (visitedPagePath === menuItemPath) {
              const progressCircle = mItemI.querySelector("progress-circle");
              if (progressCircle) progressCircle.remove();
              mItemI.classList.add("visited");
              const progressValue = parseFloat(
                visitedPage.substring(visitedPage.indexOf("__vp__") + 6)
              );
              if (progressValue === 100) {
                mItemI.insertAdjacentHTML(
                  "afterbegin",
                  createProgressCircle(pColor, progressValue, 100, 1, '✓', pColor)
                );
              } else {
                mItemI.insertAdjacentHTML(
                  "afterbegin",
                  createProgressCircle("transparent", progressValue, 100, 0.3, '', pColor)
                );
              }
            }
          });
        }
      });

      // Set progress circles to chapters in menu items
      dItemsTotal.forEach((dItemI) => {
        if (!dItemI.classList.contains("progress-circle")) {
          if (!dItemI.classList.contains("dropdown-toggle")) {
            // Always check first item as completed
            dItemI.insertAdjacentHTML(
              "afterbegin",
              createProgressCircle(pColor, 0, 100, 1, '✓', pColor)
            );
          } else {
            const sibling = dItemI.nextElementSibling;
            if (sibling) {
              const childNodes = Array.from(sibling.children);
              const totalChildren = childNodes.length;
              const visitedChildren = childNodes.filter((child) =>
                child.classList.contains("visited")
              ).length;
              if (visitedChildren > 0) {
                if (visitedChildren === totalChildren) {
                  dItemI.insertAdjacentHTML(
                    "afterbegin",
                    createProgressCircle(pColor, (visitedChildren / totalChildren) * 100, 100, 1, '✓', pColor)
                  );
                } else {
                  dItemI.insertAdjacentHTML(
                    "afterbegin",
                    createProgressCircle("transparent", (visitedChildren / totalChildren) * 100, 100, 0.3, '', pColor)
                  );
                }
              } else {
                dItemI.insertAdjacentHTML(
                  "afterbegin",
                  createProgressCircle("transparent", 0, 0, 0.3, '', pColor)
                );
              }
            }
          }
          dItemI.classList.add("progress-circle");
        }
      });
      // set total number of pages
      if (!constStates.pagesTotal) {
        constStates.pagesTotal = mItems.length;
        sessionStorage.setObj("constStates", constStates);
      }
    }
    setStatesCb();
  },
  // function: specify and perform LRS query and return relevent selection of statements
  getStatementsBase: function (
    verb,
    agent,
    activity,
    registration,
    sessionid,
    since,
    until,
    relatedactivities,
    relatedagents,
    format,
    page,
    more,
    extensionsActivityId,
    statementsCount_
  ) {
    // If statementsCount_ is not provided, set 'more' to false
    if (!statementsCount_) more = false;

    // Initialize search parameters and LRS endpoint
    const searchParams = ADL.XAPIWrapper.searchParams();
    const lrsEp = new URL(cmi5Controller.endPoint.slice(0, -1));
    let sessions;

    // Set session ID if provided
    if (sessionid) searchParams["id"] = sessionid;

    // Set agent if provided, using JSON.stringify for proper formatting
    if (agent) {
      searchParams["agent"] = JSON.stringify({
        account: {
          homePage: agent.homePage,
          name: agent.name,
        },
      });
    }

    // Set registration if provided
    if (registration) searchParams["registration"] = registration;

    // Set 'since' and 'until' dates if provided
    if (since && until) {
      const collectSinceDate = new Date(since);
      const collectBeforeDate = new Date(until);
      searchParams["since"] = collectSinceDate.toISOString();
      searchParams["until"] = collectBeforeDate.toISOString();
      if (since.includes("T")) searchParams["since"] = since;
    }
    // Map verbs to their full URIs
    if (verb) {
      const verbMap = {
        edited: "https://w3id.org/xapi/dod-isd/verbs/edited",
        highlighted: "https://w3id.org/xapi/adb/verb/highlighted",
        referenced: "https://w3id.org/xapi/adb/verb/referenced",
        abandoned: "https://w3id.org/xapi/adb/verb/abandoned",
        satisfied: "https://w3id.org/xapi/adb/verb/satisfied",
        waived: "https://w3id.org/xapi/adb/verb/waived",
        viewed: "http://id.tincanapi.com/verb/viewed",
        downloaded: "http://id.tincanapi.com/verb/downloaded",
      };
      searchParams["verb"] = verbMap[verb] || `http://adlnet.gov/expapi/verbs/${verb}`;
    }

    // Set other search parameters if provided
    if (relatedactivities) searchParams["related_activities"] = relatedactivities;
    if (relatedagents) searchParams["related_agents"] = relatedagents;
    if (format) searchParams["format"] = format;
    if (activity) searchParams["activity"] = activity;

    // Configure the XAPI Wrapper
    ADL.XAPIWrapper.changeConfig({
      endpoint: cmi5Controller.endPoint,
      auth: "Basic " + cmi5Controller.authToken,
    });

    // Retrieve initial statements
    sessions = ADL.XAPIWrapper.getStatements(searchParams);

    // Function to retrieve more statements if available
    function getMoreSessions(s) {
      if (s.more && sessions.statements.length < statementsCount_) {
        s.more = lrsEp.pathname + s.more.slice(10);
        s = ADL.XAPIWrapper.getStatements("", s.more);
        sessions.statements.push(...s.statements);
        return s;
      } else {
        s.more = "";
        return s;
      }
    }
    // Retrieve additional statements if 'more' is true and there are more statements to fetch
    if (more && sessions.more && sessions.more !== "") {
      let currentSessions = sessions;
      do {
        currentSessions = getMoreSessions(currentSessions);
      } while (currentSessions.more && currentSessions.more !== "");
    }
    // Extract the statements array
    sessions = sessions.statements;

    // Filter statements by 'extensionsActivityId' if provided
    if (extensionsActivityId) {
      return sessions.filter((stmt) => {
        const grouping = stmt.context?.contextActivities?.grouping;
        const id = grouping && grouping[0]?.id;
        return id === extensionsActivityId;
      });
    }

    // Filter statements by 'page' if provided
    if (page) {
      return sessions.filter((stmt) => {
        const matchPage =
          stmt.context?.extensions?.["https://w3id.org/xapi/acrossx/activities/page"];
        return matchPage === page;
      });
    } else {
      // Sort statements by timestamp if no specific filter is applied
      const sortedSelection = new ADL.Collection(sessions);
      sortedSelection.orderBy("timestamp");
      return sortedSelection.contents;
    }
  },
  // Function: Get object ID(s) and page (pathname) of H5P interaction at a given page offset
  getH5pObjectIdAndPage: function (pageOffset) {
    const menuItems = document.querySelectorAll(".main-navbarnav a[target=_self]");
    let h5pPage = null;
    const objectIds = [];

    // Normalize the current location pathname
    const currentPath = normalizeUrl(location.pathname);

    // Find the current page in the menu items
    for (let i = 1; i < menuItems.length; i++) {
      const menuItemHref = menuItems[i].getAttribute("href");
      const menuItemPath = normalizeUrl(menuItemHref);

      // Compare the normalized paths
      if (currentPath === menuItemPath) {
        // Calculate the target index based on the page offset
        const targetIndex = i + pageOffset;

        // Ensure the target index is within bounds
        if (targetIndex >= 0 && targetIndex < menuItems.length) {
          h5pPage = menuItems[targetIndex].getAttribute("href");
        }
        break; // Stop after finding the current page
      }
    }

    // If the target H5P page is found, search for object IDs in sessionStorage
    if (h5pPage) {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const h5pKey = `h5p-obj-id___${h5pPage}`;
        if (key.includes(h5pKey)) {
          objectIds.push(sessionStorage.getItem(key));
        }
      }
    }

    return [objectIds, h5pPage];
  },
};

// function: init statesController function
handleStates = new statesController();

// Function to create progress circle HTML
function createProgressCircle(fillColor, size, strokeWidth, opacity, label, progressColor) {
  return `
    <progress-circle color="#fff" value="" offset="top" pull="-150" part="chart">
      <slice part="background" size="100%" stroke-width="100" radius="50" stroke="${progressColor}" fill="${fillColor}">
        <!--No label-->
      </slice>
      <slice part="circle" x="438" y="64" size="${size}" stroke-width="${strokeWidth}" radius="50" stroke="${progressColor}">
        <!--No label-->
      </slice>
      <style>
        [part="background"] { opacity: ${opacity}; }
        text {font-size: 28em; transform: translate(0, 170px); font-weight: 900;}
      </style>
      <slice size="190%" stroke-width="0">
        <tspan x="50%" y="50%">${label}</tspan>
      </slice>
    </progress-circle>
  `;
}
// Function to normalize URLs
function normalizeUrl(url) {
  try {
    // Create a URL object; use window.location.origin for relative URLs
    const parsedUrl = new URL(url, window.location.origin);
    // Return the pathname without trailing slash
    return parsedUrl.pathname.replace(/\/$/, '');
  } catch (error) {
    // If URL constructor fails (e.g., invalid URL), return the original URL without trailing slash
    return url.replace(/\/$/, '');
  }
}
// event DOMContentLoaded: config page on document load
document.addEventListener("DOMContentLoaded", () => {
  // Determine the project ID and related configurations based on body classes
  const bodyClassList = document.body.classList;
  if (bodyClassList.contains("pep2")) {
    projectId = "pep2";
  } else if (bodyClassList.contains("pep")) {
    projectId = "pep";
    statementsCount = 150;
  } else if (bodyClassList.contains("spi")) {
    projectId = "spi";
    // Enable canvas edit and author LA if needed
    // const enableCanvasEdit = true;
    // const enableAuthorLA = true;
    documentationtoolCid = 122;
  }
  const stpColor = sessionStorage.getItem("pColor"); 
  if (stpColor) pColor = stpColor;
  else {
    setTimeout(() => {
      const saveButton = document.querySelector("#save-button.btn.btn-warning");
      if (saveButton) sessionStorage.setItem("pColor", getComputedStyle(saveButton).backgroundColor);
    }, 0);
  }
  monkeyH5p();
  customizeTemplate();
  if (document.querySelectorAll(".course-login").length > 0) {
    constStates.courseLoginPage = location.pathname;
    sessionStorage.setObj("constStates", constStates);
    sessionStorage.setItem("courseLoggedIn", 0);
    // if dynamic link "goToPage"
    if (document.querySelector(".go-to-page"))
      sessionStorage.setItem("goToPage", "true");
    //document.getElementById("main-navbar").classList.add("d-none");
  }
  // get cmi5 parms of location.href
  if (!constStates.cmi5Parms) getCmi5Parms();

  // Parse parameters passed on the command line and set properties of the cmi5 controller.
  if (
    sessionStorage.getItem("cmi5No") === "false" &&
    location.href.indexOf("endpoint") !== -1
  ) {
    cmi5Controller.setEndPoint(parse("endpoint"));
    cmi5Controller.setFetchUrl(parse("fetch"));
    cmi5Controller.setRegistration(parse("registration"));
    cmi5Controller.setActivityId(parse("activityid"));
    cmi5Controller.setActor(parse("actor"));
    // Call the cmi5Controller.startUp() method. Two call back functions are passed:
    // cmi5Ready......This function is called once the controller has fetched the authorization token, read the State document and the agent Profile.
    // startUpError...This function is called if the startUp() method detects an error.
    cmi5Controller.startUp(cmi5Ready, startUpError);
  }
  if (sessionStorage.getItem("terminated")) userAlerts("golms");
});
// function: this method was passed to the cmi5Controller.startup() call.
function cmi5Ready() {
  // Set additional properties for the xAPI object.
  // The cmi5Controller already knows the object ID to use in cmi5-defined statements since it is passed on the launch command.
  // It does not know:
  // 1) The langstring used by the AU.
  // 2) The actitityType
  // 3) The name of the AU
  // 4) The description of the AU
  // Typo3: constants editable in template of AU - pass the 4 values of cmi5ObjectProperties (cop)
  let cop = JSON.parse(sessionStorage.getItem("cmi5ObjectProperties"));
  cmi5Controller.setObjectProperties(cop[0], cop[1], cop[2], cop[3]);
  cmi5Controller.dLang = cop[0];
  cmi5Controller.dTitle = '"' + cop[2] + '"';
  // Perform any other setup actions required by the AU here.
  constStates.launchMode = cmi5Controller.launchMode;
  sessionStorage.setObj("constStates", constStates);
  // check if logged in
  if (parseInt(sessionStorage.getItem("courseLoggedIn")) > 0) { 
    // Send the initialized statement, but only on cmi5Init (i.e. at the beginning of the session)!
    let launchedSessions;
    if (!sessionStorage.getItem("cmi5Init")) {
      launchedSessions = handleStates.getStatementsBase(
        "launched",
        cmi5Controller.agent.account,
        "",
        cmi5Controller.registration
      );
      if (launchedSessions.length > 0) {
        if (projectId === "spi") {
          let dname = cop[2];
          dname = dname.substring(dname.lastIndexOf(" ") + 1, dname.length);
          sessionStorage.setItem("schrittnr", dname);
        }
        if (document.querySelector(".jumbotron-content .text-light"))
          document.querySelector(".jumbotron-content .text-light").innerHTML = cop[2];
        constStates.courseTitle = cop[2];
        sessionStorage.setObj("constStates", constStates);
        cmi5Controller.dLang = cop[0];
        cmi5Controller.dTitle = '"' + cop[2] + '"';
      }
      // send Initialized
      sendDefinedStatementWrapper("Initialized");
      sessionStorage.setItem("cmi5Init", "true");
      sessionStorage.setItem("cmi5No", "false");
    }
    // on init/move to a new page perform bookmarking and highlight visited pages in menu (progress)
    launchStates(launchedSessions);

    // if dynamic link "goToPage"
    if (
      sessionStorage.getItem("goToPage") &&
      sessionStorage.getItem("goToPage") === "true" &&
      enableGoToPage
    ) {
      let sessions,
        since = new Date(),
        until = new Date();
      since.setSeconds(since.getSeconds() - 250);
      until.setSeconds(until.getSeconds() + 250);
      sessionStorage.setItem("goToPage", "false");
      // sessions = handleStates.getStatementsBase("progressed", "", "", "", "", since, until);
      // console.log(sessions);
      for (let i = 0; i < sessions.length; i++) {
        referrer =
          sessions[i].context.extensions[
            "http://id.tincanapi.com/extension/referrer"
          ];
      }
      location.href =
        location.origin +
        "/sandbox/lernthemen/lernthema/lernmodule/neues-lernmodul/inhalt/inhalt/inhalt-seite-1";
    }
    if (!sessionStorage.getItem("statesInit"))
      document.querySelector("body").style.display = "block";
  }
  // on launch of AU, log in as frontend user
  else feLogIn();
}
// function: log in as frontend user
function feLogIn() {
  // hide anything during log in
  sessionStorage.setItem("courseLoggedIn", 1);
  let formData = document.querySelector(".course-login form"),
    inp = formData.querySelectorAll("input"),
    butn = formData.querySelectorAll("fieldset .btn.btn-primary"),
    coursePw = "devuser3j8d03mx7", // + document.querySelectorAll(".auth")[0].innerHTML.trim(), //location.pathname + document.querySelectorAll(".auth")[0].innerHTML.trim(),
    courseId = "devuser"; // location.pathname;
  formData.setAttribute("autocomplete", "off");
  if (coursePw.length > 100) coursePw = coursePw.substring(0, 100);
  else if (courseId.length > 100) courseId = courseId.substring(0, 100);
  for (let i = 0; i < inp.length - 2; i++) {
    inp[i].type = "hidden";
    if (inp[i].name == "user") inp[i].value = courseId;
    else if (inp[i].name == "pass") inp[i].value = coursePw;
    else if (inp[i].name == "submit") inp[i].click();
  }
  if (butn.length > 0) butn[0].click();
}
// function: add "exit course" button to header, style jumbotron image, style "next" button etc.
function customizeTemplate() {
  function handleScroll(event) {
    event.preventDefault();
    if (document.querySelector(".first-page"))
      window.scrollTo({ top: 1, behavior: "instant" });
    else window.scrollTo({ top: 60, behavior: "instant" });
  }
  window.addEventListener("scroll", handleScroll);
  setTimeout(() => {
    window.removeEventListener("scroll", handleScroll);
  }, 600);
  sitePreloader("show");
  document.querySelector("html").setAttribute("lang", "de");
  // add, style buttons in header
  let b1 =
      '<div data-tooltip="Merksatz sehen" class="btn styled rules-au-button"><i class="fas fa-exclamation"></i></div>',
    b2 =
      '<div data-tooltip="Textmarkierungen löschen" class="btn styled notes-au-button"><i class="fas fa-pen"></i></div>',
    b3 =
      '<div data-tooltip="Exit" class="btn-close btn btn-close-white styled exit-au-button"></div>',
    navbarContainer = document.querySelectorAll("#main-navbar .container"),
    offcanvasHeader = document.querySelectorAll(".offcanvas-header"),
    offcanvasBody = document.querySelectorAll(".offcanvas-body"),
    pageId = document.querySelector("body").id,
    pageItems = document.querySelectorAll(".page-item");
  if (navbarContainer.length > 0) {
    //navbarContainer[0].insertAdjacentHTML("beforeend", b1);
    //navbarContainer[0].insertAdjacentHTML("beforeend", b2);
    navbarContainer[0].insertAdjacentHTML("beforeend", b3);
  }
  // show page scroll progress bar below header
  if (document.querySelector("#main-navbar"))
    document
      .querySelector("#main-navbar")
      .insertAdjacentHTML(
        "afterend",
        "<div class='page-progress-bar-wrapper'><div class='page-progress-bar-bg'></div><div class='page-progress-bar'></div></div>"
      );

  // customize jumbotron image on start page
  let jumbotronImage = document.querySelectorAll(".jumbotron.background-image");
  if (jumbotronImage.length > 0 && constStates.jumbotron) {
    jumbotronImage[0].insertAdjacentHTML(
      "beforebegin",
      "<style> #" +
        jumbotronImage[0].id +
        ".jumbotron {background-image: " +
        constStates.jumbotron +
        "!important}</style>"
    );
    document.querySelector(".jumbotron-content .text-center").innerHTML =
      constStates.courseTitle;
  }
  // customize prev-next buttons on init page
  if (pageItems.length > 0) {
    let pageItemsA = document.querySelectorAll(".page-item a"),
      pageItemsArrow = document.querySelectorAll(".page-item a span"),
      varArrowN = document.querySelectorAll(".page-item a span i"),
      mItemsTotal = document.querySelectorAll(
        ".main-navbarnav a[target=_self]"
      );
    // hide prev page button on init page
    if (pageItems.length > 1) {
      if (safari) window.scrollTo({ top: 60, behavior: "instant" });
      else window.scrollTo({ top: 1, behavior: "instant" });
      document
        .querySelector("#page-wrapper")
        .insertBefore(
          pageItems[0],
          document.querySelector("#page-wrapper").children[0]
        );
      pageItems[0].classList.add(
        "prev-page",
        "pagination",
        "justify-content-center"
      );
      pageItems[1].classList.add("next-page");
      pageItemsA[0].innerHTML = "<span>Zurück</span>";
      pageItemsA[1].innerHTML = "Weiter";
      pageItemsA[0].insertBefore(pageItemsArrow[0], pageItemsA[0].children[0]);
      pageItemsA[1].appendChild(pageItemsArrow[1]);
      varArrowN[0].className = "";
      varArrowN[1].className = "";
      varArrowN[0].classList.add("fas", "fa-chevron-up");
      varArrowN[1].classList.add("fas", "fa-chevron-down");
      pageItemsA[0].classList.add("text-center", "text-grid");
      pageItemsA[1].classList.add("text-center", "text-grid");
    } else if (
      mItemsTotal.length > 0 &&
      location.pathname.includes(mItemsTotal[1].getAttribute("href"))
    ) {
      pageItems[0].classList.add("next-page");
      pageItemsA[0].innerHTML = "Weiter";
      pageItemsA[0].appendChild(pageItemsArrow[0]);
      varArrowN[0].className = "";
      varArrowN[0].classList.add("fas", "fa-chevron-down");
      pageItemsA[0].classList.add("text-center", "text-grid");
    } else if (jumbotronImage.length < 1) {
      // hide prev page button on init page
      if (safari) window.scrollTo({ top: 60, behavior: "instant" });
      else window.scrollTo({ top: 1, behavior: "instant" });
      document
        .querySelector("#page-wrapper")
        .insertBefore(
          pageItems[0],
          document.querySelector("#page-wrapper").children[0]
        );
      pageItems[0].classList.add(
        "prev-page",
        "pagination",
        "justify-content-center"
      );
      pageItemsA[0].innerHTML = "<span>Zurück</span>";
      pageItemsA[0].insertBefore(pageItemsArrow[0], pageItemsA[0].children[0]);
      varArrowN[0].className = "";
      varArrowN[0].classList.add("fas", "fa-chevron-up");
      pageItemsA[0].classList.add("text-center", "text-grid");
    }
    setTimeout(() => {
      pageItems[0].classList.add("item-fade-in");
      if (pageItems.length === 2) pageItems[1].classList.add("item-fade-in");
    }, 1000);
  }
  // customize start page (header, footet, hide prev next buttons etc)
  if (document.querySelector("footer.start-page")) {
    if (!constStates.startPageId) {
      constStates.startPageId = pageId;
      sessionStorage.setObj("constStates", constStates);
    }

    if (pageItems.length > 0) pageItems[0].style.display = "none";

    if (document.querySelector("#main-navbar")) {
      document.querySelector("#main-navbar").style.display = "none";
      document.querySelector("#page-footer").classList.remove("py-4");
    }
    if (document.querySelectorAll(".start-button")) {
      document
        .querySelector(".start-button")
        .addEventListener("click", function () {
          document.querySelector(".pagination .page-link").click();
        });
    }
  } else if (offcanvasBody.length > 0) {
    // show progress bar and image on menu
    offcanvasBody[0].classList.add("fs-4", "fw-light");
    offcanvasBody[0].insertAdjacentHTML(
      "afterbegin",
      '<div class="progress"><div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div></div>'
    );
    offcanvasHeader[0].insertAdjacentHTML(
      "afterbegin",
      '<div class="module-title fs-4 fw-light" style="background-image:"></div>'
    );
  }

  function exitAUDialog() {
    document.querySelector(".btn.exit-dialog").click();
    document
      .querySelector("footer .modal-body .exit-au") 
      .insertAdjacentHTML(
        "afterbegin",
        '<div class="spinner-border text-primary d-none" role="status"><span class="visually-hidden">Loading...</span></div>'
      );
  }

  function modalNotesDialog() {
    let modalNotes = document.querySelectorAll(".container button.modal-notes");
    if (modalNotes.length > 0) modalNotes[0].click();
    else userAlerts("nonotes");
  }

  function modalRulesDialog() {
    let modalRules = document.querySelectorAll(".container button.modal-rules");
    if (modalRules.length > 0) modalRules[0].click();
    else userAlerts("noinfo");
  }

  window.addEventListener(
    "load",
    function (e) {
      let menuImage = document.querySelectorAll(
          ".offcanvas-header .module-title"
        ),
        exitAuButton = document.querySelectorAll(".modal .exit-au-button"),
        resumeButton = document.querySelectorAll(".modal .resume-button"),
        rulesAuButton = document.querySelectorAll(".navbar .rules-au-button"),
        notesAuButton = document.querySelector(".navbar .notes-au-button"),
        navbarExitAuButton = document.querySelectorAll(
          ".navbar .exit-au-button"
        ),
        summaryExitAuButton = document.querySelectorAll(
          "#page-content .exit-au-button"
        ),
        modalNotes = document.querySelectorAll(".container button.modal-notes"),
        modalRules = document.querySelectorAll(".container button.modal-rules"),
        closeButton = document.querySelectorAll(".modal .close-button"),
        modalCloseButton = document.querySelectorAll("button.btn-close"),
        pageContent = document.getElementById("page-content"),
        jumbotron = document.querySelector(".jumbotron"),
        summary = document.querySelector(".summary-highlights"),
        cardButtons = document.querySelectorAll(".frontside .card-footer"),
        jumbotronImage = document.querySelectorAll(
          ".jumbotron.background-image"
        ),
        spokenWord_ = document.querySelectorAll(".spoken-word"),
        navbarToggler = document.querySelector(".navbar-toggler"),
        speechbubbl = document.querySelectorAll(".bubble-text"),
        dpnglossaryTerm = document.querySelector(".dpnglossary.details"),
        dpnglossaryLink = document.querySelectorAll(".dpnglossary.link");

      // load speechbubbles
      if (speechbubbl.length > 0) {
        loadScript_('speechbubbles.js')
          .then((script) => {
            loadSpeechBubbles(speechbubbl);
            if (sessionStorage.getItem("cmi5No") === "false") {
              setTimeout(() => {
                for (let i = 0; i < speechbubbl.length; i++) {
                  sessionStorage.removeItem("sBubbleData_" + i);
                }
              }, 2000);
            }
          });
      }
      // style jumbotron image at start page
      if (jumbotronImage.length > 0 && !constStates.jumbotron) {
        jumbotronImage = jumbotronImage[0];
        let style =
            jumbotronImage.currentStyle ||
            window.getComputedStyle(jumbotronImage, false),
          bi = style.backgroundImage;
        bi = "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), " + bi;
        jumbotronImage.insertAdjacentHTML(
          "beforebegin",
          "<style> #" +
            jumbotronImage.id +
            ".jumbotron {background-image: " +
            bi +
            "!important}</style>"
        );
        constStates.jumbotron = bi;
        sessionStorage.setObj("constStates", constStates);
      }
      // add spokenword controls to relevant text elements
      if (spokenWord_ && enableSpokenWord) {
        function sp(spokenWord) {
          for (
            let i = 0;
            i < spokenWord.querySelectorAll("button").length;
            i++
          ) {
            spokenWord
              .querySelectorAll("button")
              [i].classList.add("btn", "btn-warning");
          }
          spokenWord
            .querySelector("button[aria-label=Play]")
            .addEventListener("click", updatePlayPause);

          function updatePlayPause() {
            notesAuButton.click();
            if (spokenWord.querySelector("button[aria-label=Play]"))
              spokenWord.querySelector("button[aria-label=Play]").innerHTML =
                '<i class="bi bi-play-fill"></i>';

            if (spokenWord.querySelector("button[aria-label=Pause]"))
              spokenWord.querySelector("button[aria-label=Pause]").innerHTML =
                '<i class="bi bi-pause-fill"></i>';
          }
          spokenWord.querySelector("button[aria-label=Settings]").innerHTML =
            '<i class="bi bi-gear-fill"></i>';
          spokenWord.querySelector("button[aria-label=Play]").innerHTML =
            '<i class="bi bi-play-fill"></i>';
          spokenWord.querySelector("button[aria-label=Forward]").innerHTML =
            '<i class="bi bi-skip-forward-fill"></i>';
          spokenWord.querySelector("button[aria-label=Previous]").innerHTML =
            '<i class="bi bi-skip-backward-fill"></i>';
        }
        for (let i = 0; i < spokenWord_.length; i++) {
          sp(spokenWord_[i]);
        }
      }
      // iframe.contentDocument.querySelector("video").muted = true;
      // iframe.contentDocument.querySelector("video").play();
      // iframe.contentDocument.querySelector("video").unmuted = true;
      // if (parseInt(sessionStorage.getItem("courseLoggedIn")) > 0 && document.querySelectorAll('.video iframe').length > 0) {

      // add and update progress circles to index items in menu
      if (sessionStorage.getItem("cmi5No") === "false") {
        if (navbarToggler) {
          navbarToggler.addEventListener("click", () => {
            // Retrieve the class list from sessionStorage
            const classList = sessionStorage.getItem("mItemCurrentPage");
            if (!classList) return; // Exit if no class list is found
        
            const classes = classList.split(" ");
            const selector = classes.map((cls) => `.${cls}`).join("");
            const menuItem = document.querySelector(selector);
        
            if (!menuItem) return; // Exit if the menu item is not found
        
            const parentNode = menuItem.parentNode;
            parentNode.classList.add("show");
        
            const dropdownToggle = parentNode.parentNode.querySelector(
              `#${parentNode.parentNode.id} > a.dropdown-toggle`
            );
        
            if (dropdownToggle) {
              dropdownToggle.setAttribute("aria-expanded", "true");
            }
        
            const progressBar = document.querySelector(".page-progress-bar");
            const progressBarWidth = progressBar ? progressBar.style.width : "0%";
            const progressValue = parseFloat(progressBarWidth);
        
            // Remove existing progress circle
            const existingProgressCircle = menuItem.querySelector("progress-circle");
            if (existingProgressCircle) {
              existingProgressCircle.remove();
            }
        
            // Determine progress circle parameters
            let fillColor = "transparent";
            let backgroundOpacity = "0.3";
            let label = "";
        
            if (progressValue >= 100) {
              fillColor = pColor;
              backgroundOpacity = "1";
              label = "✓";
            }
        
            // Create progress circle HTML
            const progressCircleHTML = createProgressCircle(fillColor, progressValue, 100, backgroundOpacity, label, pColor);
        
            // Insert the new progress circle
            menuItem.insertAdjacentHTML("afterbegin", progressCircleHTML);
          });
        }
        if (sessionStorage.getItem("h5pstatements")) {
          let h5pStmts = JSON.parse(sessionStorage.getItem("h5pstatements"));
          cmi5Controller.sendStatements(
            h5pStmts,
            sessionStorage.removeItem("h5pstatements")
          );
        }
        // bug fix on additional chars like ä, ö, ü added by dpnglossary
        if (dpnglossaryLink) {
          function replaceSpecificCharAfterClosingATag(htmlString) {
            return htmlString.replace(
              /(<\/a>[äöü])/g,
              function (match, group1) {
                return group1.slice(0, -1) + " ";
              }
            );
          }
          let htmlContent;
          for (let i = 0; i < dpnglossaryLink.length; i++) {
            if (dpnglossaryLink[i].parentElement) {
              htmlContent = dpnglossaryLink[i].parentElement.innerHTML;
              dpnglossaryLink[i].parentElement.innerHTML =
                replaceSpecificCharAfterClosingATag(htmlContent);
            }
          }
        }
        // get links to allow cmi5 session on the following links...
        let navLinks = document.querySelectorAll(
          ".dropdown-item, .start-button, .nav-link, .page-link, .resume-button, .dpnglossary.link, .dpnglossary.details + a, .summary-highlights a"
        );
        // allow cmi5 session on the following links...
        if (navLinks.length > 0 && enablePageCompleted && projectId !== undefined) {
          for (let i = 0; i < navLinks.length; i++) {
            if (!navLinks[i].classList.contains("dropdown-toggle")) {
              navLinks[i].addEventListener("click", function (event) {
                xMouseDown = true;
                if (constStates.launchMode.toUpperCase() !== "BROWSE")
                  pageCompleted(event, navLinks[i]);
                setTimeout(function () {
                  xMouseDown = false;
                }, 2500);
              });
            }
          }
        }
        // init video tracking
        if (enableVideoTracking) handleVideoStatements();
        // textHightlighting
        if (navbarContainer.length > 0 && !jumbotron && enableHighlighting) {
          textHightlighting(pageContent, notesAuButton);
          if (summary) summaryHighlights();
        }

        if (jumbotron) handleStates.pageTitle = "Start";

        if (menuImage.length > 0) {
          menuImage[0].style.backgroundImage = constStates.jumbotron;
          menuImage[0].innerHTML = constStates.courseTitle;
        }
      }
      if (modalNotes.length === 0 && notesAuButton) notesAuButton.classList.remove("text-highlighted");

      if (closeButton.length > 0) {
        for (let i = 0; i < closeButton.length; i++) {
          for (let j = 0; j < modalCloseButton.length; j++) {
            modalCloseButton[j].classList.add("btn-close-white");
          }
          closeButton[i].addEventListener("click", function () {
            for (let j = 0; j < modalCloseButton.length; j++) {
              modalCloseButton[j].click();
            }
          });
        }
      }
      // t3sb card flipper bug - remove multiple - buttons
      if (cardButtons.length > 0) {
        for (let i = 0; i < cardButtons.length; i++) {
          cardButtons[i].addEventListener("click", function () {
            let cf = cardButtons[i]
              .closest(".mainflip")
              .querySelectorAll(".backside .card-footer");
            if (cf.length > 1) {
              for (let j = 1; j < cf.length; j++) {
                cf[j].remove();
              }
            }
          });
        }
      }
      if (exitAuButton.length > 0)
        exitAuButton[0].addEventListener("click", function () {
          document
            .querySelector("footer .modal-body .exit-au .spinner-border") 
            .classList.remove("d-none");
          document.querySelectorAll( 
            "footer .modal-body .exit-au p"
          )[1].innerHTML = "Lernmodul wird beendet...";
          for (let i = 0; i < document.querySelectorAll("footer .modal-body .ce-html").length; i++) {
            document.querySelectorAll("footer .modal-body .ce-html")[i].style.display = "none";
          }
          setTimeout(() => {
            finishAU();
          }, 0);
        });

      if (resumeButton.length > 0)
        resumeButton[0].addEventListener("click", function () {
          handleStates.goToBookmarkedPage();
        });

      if (rulesAuButton.length > 0)
        rulesAuButton[0].addEventListener("click", function () {
          modalRulesDialog();
        });
      if (dpnglossaryTerm) {
        let dpn = document.querySelector(".dpnglossary.details + a");
        dpn.classList.add(
          "btn-close",
          "btn",
          "btn-close-white",
          "styled",
          "dpnglossary"
        );
        document.querySelector(".btn-close.btn.dpnglossary").href =
          sessionStorage.getItem("glossarybacklink");
        dpn.setAttribute("alt", dpn.innerHTML);
        dpn.innerHTML = "";
        document.querySelector("#page-content main div").before(dpn);
        document.querySelector("#page-wrapper").classList.add("dpnglossary-bg");
        setTimeout(() => {
          document.querySelector("#page-content main #buttons").appendChild(dpn);
        }, 0);
        if (sessionStorage.getItem("scrollpos"))
          sessionStorage.setItem(
            "scrollLatest",
            sessionStorage.getItem("scrollpos")
          );
      }

      /*if (notesAuButton.length > 0) notesAuButton[0].addEventListener("click", function() {
      modalNotesDialog();
      });*/
      if (navbarExitAuButton.length > 0)
        navbarExitAuButton[0].addEventListener("click", function () {
          exitAUDialog();
        });

      if (summaryExitAuButton.length > 0) {
        if (projectId === "spi") summaryExitAuButton[0].addEventListener("click", function () {
          handleStates.progress = 100;
          exitAUDialog();
        });
        else summaryExitAuButton[0].addEventListener("click", function () {
          sendAllowedStatementWrapper("Edited", "", "", "", "", "", true);
          handleStates.progress = 100;
          finishAU();
        });
      }
      // when launch mode is set to browse, enable author LA
      if (
        sessionStorage.getItem("cmi5No") === "false" &&
        constStates.launchMode //&& enableAuthorLA
        //constStates.launchMode.toUpperCase() === "BROWSE"
      ) {
        var h5pCe = document.querySelectorAll(
            "#page-content main div.ce-h5p_view"
          ),
          //mainCe = document.querySelectorAll( "#page-content main div[data-cmi5$='1']"),
          mainCe = document.querySelectorAll(
            "#page-content main div[data-cmi5]"
          ),
          echartType,
          echartType_,
          mod = document.querySelector("#page-content main");
        mod.insertAdjacentHTML("afterbegin", '<div id="buttons"></div>');
        let modButons = document.querySelector("#page-content main #buttons");
        function addButton(modButons, index, label) {
          modButons.insertAdjacentHTML(
            "afterbegin",
            '<button type="button" class="btn-celabel' +
              index +
              ' fabx btn btn-primary" data-bs-toggle="modal" data-bs-target="#canvasModal">LA</button>'
          );
          modButons.querySelector(".btn-celabel" + index).innerHTML = label;
        }
        if (
          sessionStorage.getItem("cmi5No") === "false" &&
          constStates.launchMode && enableAuthorLA
          //constStates.launchMode.toUpperCase() === "BROWSE"
        ) {
          for (let i = 0, ceList; i < mainCe.length; i++) {
            switch (mainCe[i].dataset.cmi5.split(" ")[0]) {
              /* case "experienced":
              echartType = 1;
              addButton(modButons, echartType);
              break; */
              /* case "interacted":
              echartType = 2;
              addButton(modButons, echartType);
              break; */
              case "checked":
                echartType = "05";
                addButton(modButons, echartType, "Dauer pro Tag");
                break;
              case "played":
                echartType = "04";
                addButton(modButons, echartType, "Status H5P Komp.");
                break;
              case "viewed":
                echartType = "06";
                addButton(modButons, echartType);
                break;
              case "paused":
                echartType = "07";
                addButton(modButons, echartType);
                break;
              case "seeked":
                echartType = "08";
                addButton(modButons, echartType, "Videos Nutzung User");
                break;
              case "ended":
                echartType = "09";
                addButton(modButons, echartType, "Videos Nutzung Mittelwert");
                break;
              // case "reviewed":
              //   echartType = "10";
              //   addButton(modButons, echartType, "Poll");
              //   break;
            }
            //mainCe[i].insertAdjacentHTML(

            /*ceList = mainCe[i].classList;
          for (let j = 0; j < ceList.length; j++) {
            if (ceList[j].indexOf("ce-") != -1) {
              ce = ceList[j];
              break;
            }
          }
          mainCe[i].querySelector(".btn-celabel").innerHTML =
            "H5P: " + h5pCe[0].children[1].innerHTML;
          h5pCe[0].before(mainCe[i].querySelector(".btn-celabel"));*/
          }
        }
        mod.insertAdjacentHTML(
          "afterend",
          '<div class="modal fade" id="canvasModal" tabindex="-1" data-bs-backdrop="true" aria-labelledby="canvasModalLabel" aria-hidden="true"> <div class="modal-dialog"> <div class="modal-content"><div class="modal-header"><h2 class="" id="canvasModalLabel">Modal title</h1> <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> </div> <div class="modal-body"><div class="spinner-text h3">Daten werden geladen ...</div><div class="d-block spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><div id="container2" class="ec-canvas-wrapper" style="min-width: 100%; min-height: 70vh;"></div> </div> </div> </div> </div>'
        );
        let echartModal = document.getElementById("canvasModal"),
          preEcCanvas = document.querySelector(
            "#canvasModal .modal-body .spinner-border"
          );
        document.querySelector(".modal .spinner-border").style.position = "relative";
        document.querySelector(".modal .spinner-border").style.left = "calc(50% - 2rem)";
        echartModal.addEventListener("shown.bs.modal", function (event) {
          let i = event.relatedTarget.className,
            btnCelabel = i.substring(
              i.indexOf("btn-celabel") + "btn-celabel".length,
              i.indexOf("btn-celabel") + "btn-celabel".length + 2
            );
          //preEcCanvas.style.display.classList;
          preEcCanvas.style.display = "block";
          document.getElementById("canvasModalLabel").innerHTML =
            event.relatedTarget.innerHTML;
          echartType_ = "echarts" + btnCelabel;
          window[echartType_](event, "container2", 0);
          document.querySelector(".modal .spinner-border").style.visibility = "hidden";
        });
        echartModal.addEventListener("hidden.bs.modal", function (event) {
          document.getElementById("container2").remove();
          document.querySelector(".modal .spinner-border").classList.remove("d-none");
          preEcCanvas.insertAdjacentHTML(
            "afterend",
            '<div id="container2" class="ec-canvas-wrapper" style="min-width: 100%; min-height: 70vh;"></div>'
          );
        });
      }
    },
    { once: true }
  );
}
// function: LRS query on success score of H5P interaction at page "page"
function echarts01(event, container, page, t) {
  loadScript_('echarts01.js')
    .then((script) => {
      echarts01_(event, container, page, t);
    });
}
// function: LRS query on result of poll of H5P interaction at page "page"
function echarts02(event, container, page, t) {
  loadScript_('echarts02.js')
    .then((script) => {
      echarts02_(event, container, page, t);
    });
}
// function: LRS query on visits of current page, on progress (pages visited) and on duration at current page
function echarts31(event, container, page, t) {
  loadScript_('echarts31.js')
    .then((script) => {
      echarts31_(event, container, page, t);
    });
}
// function: ref. to echarts31
function echarts32(event, container, page, t) {
  loadScript_('echarts32.js')
    .then((script) => {
      echarts23_(event, container, page, t);
    });
}
// function: ref. to echarts31
function echarts33(event, container, page, t) {
  loadScript_('echarts33.js')
    .then((script) => {
      echarts33_(event, container, page, t);
    });
}
// function: Wer hat welche H5P-Interaktionen mit welchem Erfolg bearbeitet?
function echarts04(event, container, page, t, mode, h5pObj) {
  loadScript_('echarts04.js')
    .then((script) => {
      echarts04_(event, container, page, t, mode, h5pObj);
    });
}
// function: Wann und wie lange waren einzelne Nutzer im Lernmodul?
function echarts05(event, container, page, t) {
  loadScript_('echarts05.js')
    .then((script) => {
      echarts05_(event, container, page, t);
    });
}
function echarts08(event, container, page, t, mode, vObj) {
  loadScript_('echarts08.js')
    .then((script) => {
      echarts08_(event, container, page, t, mode, vObj);
    });
}
// function: Wann und wie lange waren einzelne Nutzer im Lernmodul?
function echarts09(event, container, page, t) {
  loadScript_('echarts09.js')
    .then((script) => {
      echarts09_(event, container, page, t);
    });
}
// function: Welche Erfahrungen haben Sie mit fremden Kindern gemacht?
function echarts10(event, container, page, t) {
  loadScript_('echarts10.js')
    .then((script) => {
      echarts10_(event, container, page, t);
    });
}
// function: Was können Sie besonders gut?
function echarts11(event, container, page, t) {
  loadScript_('echarts11.js')
    .then((script) => {
      echarts11_(event, container, page, t);
    });
}
// function: Wie gut kennen Sie die Räume, in denen Sie die Kinder beaufsichtigen werden?
function echarts12(event, container, page, t) {
  loadScript_('echarts12.js')
    .then((script) => {
      echarts12_(event, container, page, t);
    });
}
// function: Welche Aufgaben im Umgang mit den Kindern gefallen Ihnen besonders gut?
function echarts13(event, container, page, t) {
  loadScript_('echarts12.js')
    .then((script) => {
      echarts12_(event, container, page, t);
    });
}
// function: Was glauben Sie, nach welchen Adressen wird oft gefragt?
function echarts14(event, container, page, t) {
  loadScript_('echarts14.js')
    .then((script) => {
      echarts14_(event, container, page, t);
    });
}
// function: Auf welche Themen freuen Sie sich?
function echarts15(event, container, page, t) {
  loadScript_('echarts15.js')
    .then((script) => {
      echarts15_(event, container, page, t);
    });
}
// function: Wie entspannen Sie sich, was tun Sie?
function echarts16(event, container, page, t) {
  loadScript_('echarts16.js')
    .then((script) => {
      echarts16_(event, container, page, t);
    });
}
// function: Wie entspannen Sie sich, was tun Sie?
function echarts17(event, container, page, t) {
  loadScript_('echarts17.js')
    .then((script) => {
      echarts17_(event, container, page, t);
    });
}
// function: store, restore, remove highlighted text
function textHightlighting(
  pageContent,
  notesAuButton,
  createObject,
  readObject
) {
  if (!enableHighlighting) return;
  var lp = location.pathname;
  if (readObject) {
    // read object from LRS via State API and re-store sessionStorage
    for (let i = 0; i < readObject.length; i++) {
      sessionStorage.setItem(
        Object.keys(readObject[i])[0],
        Object.values(readObject[i])[0]
      );
    }
  } else if (createObject) {
    // set highlighted text at relevant pages and prepare object suitable for storage in LRS via State API
    var hls = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      if (sessionStorage.key(i) === "hl___" + lp) {
        if (!cmi5Controller.hltr) textHightlighting(pageContent, notesAuButton);
        cmi5Controller.hltr.deserializeHighlights(
          sessionStorage.getItem(sessionStorage.key(i))
        );
        notesAuButton.classList.add("text-highlighted");
      }
      if (sessionStorage.key(i).indexOf("hl___") != -1) {
        hls.push({
          [sessionStorage.key(i)]: sessionStorage.getItem(sessionStorage.key(i))
        });
      }
    }
    return hls;
  } else {
    // set EventListener to highlight text and to delete highlights
    cmi5Controller.hltr = new TextHighlighter(pageContent);
    pageContent.addEventListener("click", function () {
      if (!lp.indexOf("lerngruppe") != -1) {
        if (cmi5Controller.hltr.serializeHighlights().length > 2) {
          sessionStorage.setItem(
            "hl___" + lp,
            cmi5Controller.hltr.serializeHighlights()
          );
          notesAuButton.classList.add("text-highlighted");
        }
      }
    });
    /*iframe.contentDocument.body.addEventListener('click', function() {
      if (!lp.indexOf("lerngruppe") != -1) sessionStorage.setItem("hli___" + lp, cmi5Controller.hltrIframe.serializeHighlights());
    });*/
    notesAuButton.addEventListener("click", function () {
      cmi5Controller.hltr.removeHighlights();
      // cmi5Controller.hltrIframe.removeHighlights();
      sessionStorage.removeItem("hl___" + lp);
      notesAuButton.classList.remove("text-highlighted");
      // sessionStorage.removeItem("hli___" + lp);
    });
  }
}
// function: display list of page links with highlighted text
function summaryHighlights() {
  function rem(s) {
    return s
      .replace(/<\/?SPAN[^>]*>/gi, "")
      .replace(/<\/?i[^>]*>/gi, "")
      .replace(/<\/?svg[^>]*>/gi, "")
      .replace(/<\/?style[^>]*>/gi, "")
      .replace(/<\/?path[^>]*>/gi, "");
  }
  var lpx,
    hldiv = "",
    mtitle = document.querySelectorAll(
      ".navbar-nav.main-navbarnav .dropdown-item"
    );
  for (let i = 0; i < sessionStorage.length; i++) {
    if (
      sessionStorage.key(i).indexOf("hl___") != -1 &&
      sessionStorage.key(i).indexOf("lerngruppe") == -1 &&
      sessionStorage.key(i).indexOf("zusammenfassung") == -1
    ) {
      lpx = sessionStorage.key(i).substring(5);
      for (let j = 0; j < mtitle.length; j++) {
        if (mtitle[j].href.indexOf(lpx) != -1) {
          hldiv +=
            "<div><a href='" +
            lpx +
            "'>" +
            rem(mtitle[j].innerHTML).trim() +
            "</a></div>";
        }
      }
    }
  }
  document
    .querySelector(".summary-highlights p")
    .insertAdjacentHTML("afterend", hldiv);
  // prevent sending terminated statement on unload
  // for (
  //   let i = 0;
  //   i < document.querySelectorAll(".summary-highlights a").length;
  //   i++
  // ) {
  //   document
  //     .querySelectorAll(".summary-highlights a")
  //     [i].addEventListener("mousedown", function () {
  //       xMouseDown = true;
  //       setTimeout(function () {
  //         xMouseDown = false;
  //       }, 1500);
  //     });
  // }
}
// function: get cmi5 parms of location.href
function getCmi5Parms() {
  if (location.href.indexOf("endpoint") != -1) {
    let cmi5Parms = [];
    cmi5Parms = location.href.split("?");
    if (location.href.indexOf("&cHash") != -1)
      cmi5Parms = cmi5Parms[1].split("&cHash");
    constStates.cmi5Parms = cmi5Parms[1];
    sessionStorage.setObj("constStates", constStates);
    sessionStorage.setItem("cmi5No", "false");
  } else sessionStorage.setItem("cmi5No", "true");
}
// function: on init/move to a new page perform bookmarking, highlight visited pages in menu (progress) etc
function launchStates(launchedSessions) {
  // get/set states when resume course, indicate relevant menu items in t3 menu as visited
  handleStates.getStates(launchedSessions, handleStates.markMenuItems);
  // check MoveOn criteria
  handleStates.checkMoveOn(cmi5Controller.moveOn);
  // set statesInit session flag
  if (!sessionStorage.getItem("statesInit"))
    sessionStorage.setItem("statesInit", "true");
}
// function: This is called if there is an error in the cmi5 controller startUp method.
function startUpError() {
  userAlerts("startuperror");
}
// function: wrapper to send allowed statement
function sendAllowedStatementWrapper(
  verbName,
  score,
  duration,
  progress,
  highlighted,
  glossaryTerm,
  documentationTool
) {
  const verbUpper = verbName.toUpperCase();
  const cExtensions = cmi5Controller.getContextExtensions();

  const verbsMap = {
    EXPERIENCED: ADL.verbs.experienced,
    PROGRESSED: ADL.verbs.progressed,
    RESUMED: ADL.verbs.resumed,
    SUSPENDED: ADL.verbs.suspended,
    HIGHLIGHTED: ADL.verbs.highlighted,
    VIEWED: ADL.verbs.viewed,
    DOWNLOADED: ADL.verbs.downloaded,
    EDITED: ADL.verbs.edited,
  };

  const verb = verbsMap[verbUpper];
  
  if (constStates.launchMode.toUpperCase() !== 'NORMAL' && verbUpper !== 'DOWNLOADED') {
    // Only Initialized and Terminated verbs are allowed per section 10.0 of the spec.
    console.log(
      `When launchMode is ${constStates.launchMode}, only Initialized and Terminated verbs are allowed`
    );
    return false;
  }

  if (!verb) {
    console.log(`Invalid verb passed: ${verbName}`);
    return false;
  }

  const stmtObject = JSON.parse(sessionStorage.getItem('stmtObject'));
  const objectId = `${stmtObject.id}/objectid/${location.hostname}${location.pathname}/`;

  const stmt = cmi5Controller.getcmi5AllowedStatement(
    verb,
    { ...stmtObject, id: objectId },
    cmi5Controller.getContextActivities(),
    cExtensions
  );

  let durationFormatted;
  if (duration) {
    durationFormatted = moment.utc(Number(moment.duration(duration))).format('m:ss');
  }

  let definitionName = `${cmi5Controller.dTitle} at page "${handleStates.pageTitle}"`;

  if (verbUpper === 'RESUMED') {
    definitionName = cmi5Controller.dTitle;
  } else {
    if (verbUpper === 'PROGRESSED' && typeof progress === 'number') {
      definitionName += `, progress: ${progress}%`;
    }
    if (verbUpper === 'VIEWED' && glossaryTerm) {
      definitionName += `, glossary-term-viewed: "${glossaryTerm}"`;
    }
    if (verbUpper === 'HIGHLIGHTED') {
      definitionName += ', Text highlighted...';
    }
    if (verbUpper === 'DOWNLOADED') {
      definitionName += ', DocumentationTool was downloaded...';
    }
    if (verbUpper === 'EDITED') {
      definitionName += ', DocumentationTool entries saved...';
    }
    if (durationFormatted) {
      definitionName += `, duration: ${durationFormatted}`;
    }
  }

  stmt.object.definition = {
    name: {
      [cmi5Controller.dLang]: definitionName,
    },
    type: 'http://id.tincanapi.com/activitytype/page',
  };

  // Add UTC timestamp, required by cmi5 spec.
  stmt.timestamp = new Date().toISOString();

  // Build result object if needed
  if (duration || typeof progress === 'number' || glossaryTerm) {
    stmt.result = {};

    if (duration) {
      stmt.result.duration = duration;
    }

    const resultExtensions = {};

    if (typeof progress === 'number') {
      resultExtensions['https://w3id.org/xapi/cmi5/result/extensions/progress'] = progress;
    }

    if (glossaryTerm) {
      resultExtensions['https://w3id.org/xapi/cmi5/result/extensions/glossarytermviewed'] =
        glossaryTerm;
    }

    if (Object.keys(resultExtensions).length > 0) {
      stmt.result.extensions = resultExtensions;
    }
  }

  // Build context extensions
  const cx = {
    'https://w3id.org/xapi/acrossx/activities/page': location.pathname,
  };

  if (highlighted) {
    cx['http://risc-inc.com/annotator/activities/highlight'] = highlighted;
  }

  if (documentationTool) {
    cx['http://id.tincanapi.com/activitytype/document'] = sessionStorage.getItem(
      `h5p-state___/h5pcid_${documentationTool}`
    );
  }

  stmt.context.extensions = { ...cExtensions, ...cx };

  // Build context activities
  const parentId = `${stmtObject.id}/parentid/${location.hostname}${constStates.courseLoginPage}`;

  stmt.context.contextActivities.parent = [
    {
      id: parentId,
      definition: {
        name: {
          [cmi5Controller.dLang]: `${cmi5Controller.dTitle} at page "${handleStates.pageTitle}"`,
        },
        type: cmi5Controller.object.definition.type,
      },
      objectType: 'Activity',
    },
  ];

  stmt.context.contextActivities.grouping[0].id = stmtObject.id;

  cmi5Controller.sendStatement(stmt);

  return false;
}

// function: wrapper to send defined statement
function sendDefinedStatementWrapper(verbName, score, duration, progress) {
  const verbUpper = verbName.toUpperCase();

  const verbsMap = {
    INITIALIZED: ADL.verbs.initialized,
    COMPLETED: ADL.verbs.completed,
    PASSED: ADL.verbs.passed,
    FAILED: ADL.verbs.failed,
    TERMINATED: ADL.verbs.terminated,
  };

  const verb = verbsMap[verbUpper];

  if (!verb) {
    console.log(`Invalid verb passed: ${verbName}`);
    return false;
  }

  if (constStates.launchMode.toUpperCase() !== 'NORMAL') {
    // Only Initialized and Terminated verbs are allowed per section 10.0 of the spec.
    if (verbUpper !== 'INITIALIZED' && verbUpper !== 'TERMINATED') {
      console.log(
        `When launchMode is ${constStates.launchMode}, only Initialized and Terminated verbs are allowed`
      );
      return false;
    }
  }

  // Context extensions were read from the State document's context template
  const cExtensions = cmi5Controller.getContextExtensions();
  let success;
  let complete = null;

  if (verbUpper === 'PASSED' || verbUpper === 'FAILED') {
    // Passed and Failed statements require the masteryScore as a context extension
    const masteryScoreKey = 'https://w3id.org/xapi/cmi5/context/extensions/masteryscore';
    if (cmi5Controller.masteryScore && !cExtensions[masteryScoreKey]) {
      cExtensions[masteryScoreKey] = cmi5Controller.masteryScore;
    }

    // Per section 9.5.2 of the cmi5 spec
    success = verbUpper === 'PASSED';
  }

  if (verbUpper === 'INITIALIZED') {
    cExtensions['https://w3id.org/xapi/cmi5/context/extensions/deviceinfo'] = getDeviceInfo();
  }

  // Automatically set complete based on cmi5 rules (9.5.3)
  if (verbUpper === 'COMPLETED') {
    complete = true;
  }

  // Get basic cmi5 defined statement object
  const stmt = cmi5Controller.getcmi5DefinedStatement(verb, cExtensions);

  if (!sessionStorage.getItem('stmtObject')) {
    sessionStorage.setItem('stmtObject', JSON.stringify(stmt.object));
  }

  const { dLang, dTitle } = cmi5Controller;
  const pageTitle = handleStates.pageTitle;

  if (verbUpper === 'INITIALIZED') {
    stmt.object.definition.name = {
      [dLang]: dTitle,
    };
  } else if (verbUpper === 'TERMINATED') {
    const formattedDuration = moment.utc(Number(moment.duration(duration))).format('m:ss');
    stmt.object.definition.name = {
      [dLang]: `${dTitle} at page "${pageTitle}", session duration: ${formattedDuration}`,
    };
  } else if (verbUpper === 'COMPLETED') {
    const formattedDuration = moment.utc(Number(moment.duration(duration))).format('m:ss');
    stmt.object.definition.name = {
      [dLang]: `${dTitle} at page "${pageTitle}", attempt duration: ${formattedDuration}`,
    };
  } else {
    stmt.object.definition.name = {
      [dLang]: `${dTitle} at page "${pageTitle}"`,
    };
  }

  // Add UTC timestamp, required by cmi5 spec.
  stmt.timestamp = new Date().toISOString();

  // Do we need a result object?
  if (success !== undefined || complete !== null || score || duration || progress) {
    stmt.result = {};

    if (typeof complete === 'boolean') {
      stmt.result.completion = complete;
    }

    if (typeof success === 'boolean') {
      stmt.result.success = success;
    }

    if (typeof score === 'number') {
      stmt.result.score = {
        scaled: score,
      };
    }

    if (duration) {
      stmt.result.duration = duration;
    }

    // Statements that include success or complete must include a moveon activity in the context
    if (success || complete || verbUpper === 'FAILED') {
      stmt.context.contextActivities.category.push({
        id: 'https://w3id.org/xapi/cmi5/context/categories/moveon',
      });
    }
  }

  cmi5Controller.sendStatement(stmt);
  return false;
}

// function: handle H5P generated statements and generate cmi5 allowed statements
function handleH5P(event) {
  const h5pLib = this.libraryInfo ? this.libraryInfo.versionedNameNoSpaces : null;
  if (constStates.launchMode.toUpperCase() !== "NORMAL" && this.libraryInfo) {
    // Only "Initialized" and "Terminated" verbs are allowed per section 10.0 of the spec.
    console.log(
      `When launchMode is ${constStates.launchMode}, only Initialized and Terminated verbs are allowed`
    );

    if (
      !["DocumentationTool", "GoalsAssessmentPage", "TextInputField", "GoalsPage"].some((type) =>
        h5pLib.includes(type)
      )
    ) {
      return false;
    }
  }

  documentToolClickDownload();

  // Get H5P statement
  const H5PXapiStmt = event.data.statement;
  let stmt;
  let cid = parseInt(
    H5PXapiStmt.object.definition.extensions["http://h5p.org/x-api/h5p-local-content-id"]
  );
  const stmtObject = JSON.parse(sessionStorage.getItem("stmtObject"));
  const stmtObjectParent = JSON.parse(sessionStorage.getItem("stmtObject"));

  if (cid) sessionStorage.setItem("tempcid", cid);
  else cid = sessionStorage.getItem("tempcid");

  if (cmi5Controller.getContextExtensions() && this.libraryInfo) {
    // Store question items of the questionnaire to sessionStorage
    if (
      h5pLib.includes("SimpleMultiChoice") &&
      !sessionStorage.getItem(`SimpleMultiChoiceQuestions-${cid}`)
    ) {
      const questionnaire = JSON.parse(
        H5PIntegration.contents[`cid-${cid}`].jsonContent
      ).questionnaireElements;
      const questions = questionnaire.map((item) => item.library.params.question);
      sessionStorage.setItem(`SimpleMultiChoiceQuestions-${cid}`, JSON.stringify(questions));
    }

    // Extend cmi5 activity ID
    stmtObject.id += `/objectid/${location.hostname}${location.pathname}/h5pcid_${cid}${H5PXapiStmt.object.id}`;

    // Set activity ID for specific H5P libraries
    if (
      ["DocumentationTool", "GoalsAssessmentPage", "TextInputField", "GoalsPage"].some((type) =>
        h5pLib.includes(type)
      )
    ) {
      stmtObject.id = `https://ilias.de/cmi5/activityid/objectid/${location.hostname}/h5pcid_${cid}`;
    }
    H5PXapiStmt.object.id = stmtObject.id;
    H5PXapiStmt.object.definition.type = getActivityType(h5pLib);

    if (!H5PXapiStmt.verb.id.includes("completed")) {
      sessionStorage.setItem(
        `h5p-obj-id___${location.pathname}/h5pcid_${cid}`,
        H5PXapiStmt.object.id
      );
    }

    sessionStorage.setItem("h5ppage", location.pathname);

    // Create cmi5 allowed statement
    stmt = cmi5Controller.getcmi5AllowedStatement(
      H5PXapiStmt.verb,
      H5PXapiStmt.object,
      cmi5Controller.getContextActivities(),
      cmi5Controller.getContextExtensions()
    );

    // Add cmi5 description: "name of content type" at "name of page"
    stmt.object.definition.name = {
      [cmi5Controller.dLang]: `${cmi5Controller.dTitle}: "${h5pLib} cid: ${cid}" at page "${handleStates.pageTitle}"`,
    };

    // Add H5P library type to extensions object
    stmt.context.extensions["https://h5p.org/libraries"] = h5pLib;

    // Store question text of SimpleMultiChoiceQuestions in extensions of completed statement
    if (
      sessionStorage.getItem(`SimpleMultiChoiceQuestions-${cid}`) &&
      H5PXapiStmt.verb.id.includes("completed")
    ) {
      stmt.context.extensions["https://h5p.org/questions"] = sessionStorage.getItem(
        `SimpleMultiChoiceQuestions-${cid}`
      );
      const previousState = JSON.parse(
        sessionStorage.getItem(`h5p-state___${location.pathname}/h5pcid_${cid}`)
      );
      stmt.context.extensions["https://h5p.org/previous-state"] = JSON.stringify(
        previousState.questions
      );
    }

    // Store previous state of DocumentationTool in extensions
    const docToolState = sessionStorage.getItem(`h5p-state___/h5pcid_${cid}`);
    if (docToolState) {
      stmt.context.extensions[`https://h5p.org/documentationtool${cid}`] = docToolState;
    }

    // Add parent to contextActivities object
    stmtObjectParent.id += `/parentid/${location.hostname}${location.pathname}/`;
    stmt.context.contextActivities.parent = [
      {
        id: stmtObjectParent.id,
        definition: {
          name: {
            [cmi5Controller.dLang]: `${cmi5Controller.dTitle} at page "${handleStates.pageTitle}"`,
          },
          type: "http://id.tincanapi.com/activitytype/page",
        },
        objectType: "Activity",
      },
    ];

    stmt.context.contextActivities.grouping[0].id = stmtObject.id;

    // Add result to statement if applicable
    if (H5PXapiStmt.result) {
      stmt.result = H5PXapiStmt.result;
      sessionStorage.setItem("h5presult", H5PXapiStmt.result.success);

      if (H5PXapiStmt.result.completion) {
        sessionStorage.setItem("score", H5PXapiStmt.result.score.scaled);
        // Additional code can be added here if needed
      }
    }

    // Add UTC timestamp, required by cmi5 spec
    stmt.timestamp = new Date().toISOString();

    cmi5Controller.h5pstmts.push(stmt);

    // Send H5P statements from session storage only on "answered" or "completed"
    if (
      H5PXapiStmt.verb.id.includes("answered") ||
      H5PXapiStmt.verb.id.includes("completed")
    ) {
      cmi5Controller.sendStatements(cmi5Controller.h5pstmts);
      //console.log(cmi5Controller.h5pstmts);
      cmi5Controller.h5pstmts = [];
      // Show/hide button to display result of rating with questionnaire
      showHideRateButton();
    }

    // Update h5pstmts_ based on H5P library type
    if (
      ["DocumentationTool", "GoalsAssessmentPage", "TextInputField", "GoalsPage"].some((type) =>
        h5pLib.includes(type)
      )
    ) {
      cmi5Controller.h5pstmts_ = cmi5Controller.h5pstmts;
    } else {
      cmi5Controller.h5pstmts_ = cmi5Controller.h5pstmts_.concat(
        cmi5Controller.h5pstmts.filter(
          (statement) => !statement.verb.id.includes("interacted")
        )
      );
    }

    if (cmi5Controller.h5pstmts_.length > 0) {
      sessionStorage.setItem("h5pstatements", JSON.stringify(cmi5Controller.h5pstmts_));
    }
  }
}

function getActivityType(h5pContentType) {
  function stripVersion(h5pContentType) {
    return h5pContentType.split("-")[0];
  }
  // Mapping of H5P content types to object.definition.type
  const activityTypeMapping = {
    "H5P.Accordion": "http://adlnet.gov/expapi/activities/resource",
    "H5P.AdventCalendar": "http://adlnet.gov/expapi/activities/game",
    "H5P.Agamotto": "http://adlnet.gov/expapi/activities/media",
    "H5P.ARScavenger": "http://adlnet.gov/expapi/activities/simulation",
    "H5P.ArithmeticQuiz": "http://adlnet.gov/expapi/activities/assessment",
    "H5P.Audio": "http://adlnet.gov/expapi/activities/media",
    "H5P.AudioRecorder": "http://adlnet.gov/expapi/activities/performance",
    "H5P.BranchingScenario": "http://adlnet.gov/expapi/activities/simulation",
    "H5P.Chart": "http://adlnet.gov/expapi/activities/resource",
    "H5P.Collage": "http://adlnet.gov/expapi/activities/media",
    "H5P.Column": "http://adlnet.gov/expapi/activities/module",
    "H5P.Cornell": "http://adlnet.gov/expapi/activities/resource",
    "H5P.CoursePresentation": "http://adlnet.gov/expapi/activities/module",
    "H5P.Crossword": "http://adlnet.gov/expapi/activities/game",
    "H5P.Dialogcards": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.DocumentationTool": "http://adlnet.gov/expapi/activities/document",
    "H5P.DragQuestion": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.DragText": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.Essay": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.Blanks": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.ImageMultipleHotspotQuestion": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.ImageHotspotQuestion": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.FindTheWords": "http://adlnet.gov/expapi/activities/game",
    "H5P.Flashcards": "http://adlnet.gov/expapi/activities/flashcard",
    "H5P.GuessTheAnswer": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.IFrameEmbed": "http://adlnet.gov/expapi/activities/media",
    "H5P.MultiMediaChoice": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.ImageHotspots": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.ImageJuxtaposition": "http://adlnet.gov/expapi/activities/media",
    "H5P.ImagePair": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.ImageSequencing": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.ImageSlider": "http://adlnet.gov/expapi/activities/media",
    "H5P.InfoWall": "http://adlnet.gov/expapi/activities/resource",
    "H5P.InteractiveBook": "http://adlnet.gov/expapi/activities/module",
    "H5P.InteractiveVideo": "https://w3id.org/xapi/video/activity-type/video",
    "H5P.KewArCode": "http://adlnet.gov/expapi/activities/media",
    "H5P.MarkTheWords": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.MemoryGame": "http://adlnet.gov/expapi/activities/game",
    "H5P.MultiChoice": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.PersonalityQuiz": "http://adlnet.gov/expapi/activities/assessment",
    "H5P.QuestionSet": "http://adlnet.gov/expapi/activities/assessment",
    "H5P.Questionnaire": "http://adlnet.gov/expapi/activities/questionnaire",
    "H5P.SingleChoiceSet": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.SortParagraphs": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.SpeakTheWords": "http://adlnet.gov/expapi/activities/performance",
    "H5P.SpeakTheWordsSet": "http://adlnet.gov/expapi/activities/performance",
    "H5P.StructureStrip": "http://adlnet.gov/expapi/activities/resource",
    "H5P.Summary": "http://adlnet.gov/expapi/activities/resource",
    "H5P.Timeline": "http://adlnet.gov/expapi/activities/media",
    "H5P.TrueFalse": "http://adlnet.gov/expapi/activities/cmi.interaction",
    "H5P.TwitterUserFeed": "http://adlnet.gov/expapi/activities/media",
    "H5P.ThreeImage": "http://adlnet.gov/expapi/activities/media"
  };

  // Return the appropriate object.definition.type or a default type if not found
  return activityTypeMapping[stripVersion(h5pContentType)] || "http://adlnet.gov/expapi/activities/resource";
}

// function: read H5P state object from LRS via State API and re-store sessionStorage
function h5pState(storedH5pStates) {
  if (storedH5pStates) {
    for (const state of storedH5pStates) {
      const [key, value] = Object.entries(state)[0];
      sessionStorage.setItem(key, value);
    }
  } else {
    const h5pStates = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key.includes("h5p-state___") && !key.includes("h5p-state___/h5pcid_")) {
        const value = sessionStorage.getItem(key);
        h5pStates.push({ [key]: value });
      }
    }
    return h5pStates;
  }
}

// function: read H5P object id and page id from LRS via State API and re-store sessionStorage
function h5pObjectIdAndPage(storedH5pObjIds) {
  if (storedH5pObjIds) {
    for (const obj of storedH5pObjIds) {
      const [key, value] = Object.entries(obj)[0];
      sessionStorage.setItem(key, value);
    }
  } else {
    const h5pObjIds = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key.includes("h5p-obj-id___")) {
        const value = sessionStorage.getItem(key);
        h5pObjIds.push({ [key]: value });
      }
    }
    return h5pObjIds;
  }
}

// handle H5P.externalDispatcher on readystatechange
document.addEventListener("readystatechange", function () {
  if (sessionStorage.getItem("cmi5Init") || sessionStorage.getItem("cmi5No") === "true")
    document.querySelector("#page-wrapper").classList.add("d-block");

  if (
    "complete" === document.readyState &&
    typeof H5P !== "undefined" &&
    H5P.externalDispatcher &&
    cmi5Controller &&
    sessionStorage.getItem("cmi5No") === "false"
  ) {
    // echarts4: add echart reports to H5P CEs
    let h5pIframe = document.querySelectorAll("iframe.h5p-iframe");
    if (h5pIframe.length > 0) {
      for (let i = 0; i < h5pIframe.length; i++) {
        if (
          //constStates.launchMode.toUpperCase() === "BROWSE" &&
          enableH5pEcharts && enableAuthorLA
        ) {
          h5pIframe[i]
            .closest(".ce-h5p_view")
            .insertAdjacentHTML(
              "beforeend",
              "<div id = 'container_" +
                h5pIframe[i].id +
                "' class = 'ec-canvas-wrapper' style='margin-top: 50px; min-width: 100%; min-height: 40vh;'></div>"
            );
          echarts04(
            "",
            "container_" + h5pIframe[i].id,
            "",
            "dark",
            h5pIframe[i]
          );
        }
        h5pIframe[i].addEventListener('mouseenter', () => {
          mouseInside = true;
        });
        h5pIframe[i].addEventListener('mouseleave', () => {
          mouseInside = false;
        });
        /* if (
          (h5pIframe[i].contentDocument.querySelector(
            "button.h5p-question-check-answer"
          ) ||
          h5pIframe[i].contentDocument.querySelector(
              "button.h5p-joubelui-button"
            )) &&
          !h5pIframe[i].contentDocument.querySelector(
            "button.h5p-dialogcards-turn"
          )
        ) {
          for (let j = 0; j < sessionStorage.length; j++) {
            if (sessionStorage.key(j) === ("h5p-state___" + location.pathname + "/h5pcid_" + h5pIframe[i].dataset.contentId)) h5pIframe[i].contentDocument.querySelector("button.h5p-question-check-answer").click();
          }
        } */
      }
    }
    cmi5Controller.h5pstmts = [];
    cmi5Controller.h5pstmts_ = [];
    H5P.externalDispatcher.on("xAPI", handleH5P);
    showHideRateButton(1000);
    documentToolClickDownload();
  }
});
// function: generate user alerts generated via swal API
function userAlerts(issue) {
  switch (issue) {
    case "pageincomplete":
      swal(
        "Sie haben noch nicht alles auf dieser Seite bearbeitet! Denken Sie dabei auch an Videos, Übungen oder Abfragen ..."
      );
      break;
    case "abandoned":
      swal(
        "Sie haben das Lernmodul nicht mit dem Exit Button beendet. Bitte verwenden Sie immer den Exit Button, wenn Sie das Lernmodul beenden möchten, da sonst der erreichte Lernstand ggf. nicht gespeichert wird."
      );
      break;
    case "nointernet":
      swal(
        `Wenn die Verbindung zum Internet wiedergestellt ist, können Sie fortfahren ...`,
        {
          title: "Keine Verbindung zum Internet!",
          buttons: false,
          closeOnClickOutside: false
        }
      );
      break;
    case "golms":
      swal(
        "Die Verbindung zum LMS wurde unterbrochen. Bitte starten Sie das Lernmodul neu!",
        {
          buttons: {
            ok: "OK",
            cancel: {
              visible: false,
              closeModal: false
            }
          }
        }
      ).then((value) => {
        if (value === "ok") {
          sessionStorage.clear();
          cmi5Controller.goLMS();
        }
      });
      break;
    case "start":
      swal("Bitte verwenden Sie nicht die Browser Navigation und klicken Sie zunächst auf Start!");
      break;
    case "prevnext":
      swal("Bitte verwenden Sie die Navigation im Lernmodul!");
      break;
    case "nonotes":
      swal("Keine Notizen hier ...");
      break;
    case "noinfo":
      swal("Keine Merksätze hier ...");
      break;
    case "startuperror":
      swal(
        "An error was detected in the cmi5Controller.startUp() method.  Please check the console log for any errors."
      );
      break;
    case "nodata":
      swal("Noch keine Daten zur Auswertung vorhanden ...");
      break;
    case "nodatamodal":
      swal("Noch keine Daten zur Auswertung vorhanden ...", {
        buttons: {
          ok: "OK",
          cancel: {
            visible: false,
            closeModal: false
          }
        }
      }).then((value) => {
        if (value === "ok") {
          setTimeout(() => {
            document.querySelector(".modal.show .btn-close").click();
          }, 100);
        }
      });
      break;
  }
}
// function: show / hide site-preloader (spinner and info)
function sitePreloader(showhide) {
  let sitePreloader = document.querySelector("#site-preloader");
  if (showhide === "show") {
    if (
      sitePreloader &&
      !sessionStorage.getItem("cmi5Init") &&
      constStates.cmi5Parms
    ) {
      sitePreloader.insertAdjacentHTML(
        "afterbegin",
        "<div class='module-start h2 " + projectId + "'>Lernmodul wird gestartet ...</div>"
      );
      sitePreloader.classList.add("opacity-display");
    }
  } else {
    document.querySelector("#page-wrapper").style.display = "block";
    sitePreloader.classList.remove("opacity-display");
  }
}

// function: send "terminated" on finish AU
function finishAU() {
  var sd = handleStates.getPageDuration(
    Number(sessionStorage.getItem("startTimeStamp"))
  );
  if (constStates.launchMode.toUpperCase() === "NORMAL") 
    sendAllowedStatementWrapper("Suspended", "", sd);
  handleStates.checkMoveOn(cmi5Controller.moveOn, true);
  handleStates.setStates();
  cmi5Controller.sendAllowedState(
    "statements",
    LZString.compressToBase64(
      JSON.stringify(
        getDashboardStatements(cmi5Controller.activityId, true, true)
      )
    ),
    "",
    "",
    function () {
      sendDefinedStatementWrapper("Terminated", "", sd);
      sessionStorage.clear();
      cmi5Controller.goLMS();
    }
  );
}
// function: parse command line parameters
function parse(val) {
  let result = "Not found",
    tmp = [];
  val = val.toUpperCase();
  location.search
    .substring(1)
    .split("&")
    .forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0].toUpperCase() === val) result = decodeURIComponent(tmp[1]);
    });
  return result;
}
// function: load js file with callback if applicable
function loadScript_(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/typo3conf/ext/cmi5/Resources/Public/CmiFive/Js/" + src;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.append(script);
  });
}
// function: get delta of new statments and push to statements collection for echarts dashboards
function getDashboardStatements(activityId, relatedactivities, relatedagents) {
  let stmtsQ = sessionStorage.getItem("statements"),
    since = "",
    until = "",
    qStored;
  // check if previuos data of echarts dashboard in sessiostorage and get data if applicable
  if (stmtsQ && stmtsQ.length > 2) {
    stmtsQ = sessionStorage.getObj("statements");
    until = new Date();
    since = stmtsQ[stmtsQ.length - 1].timestamp;
    qStored = true;
  }
  // query relevant statements in LRS and get selection
  let selection = handleStates.getStatementsBase(
    "", //verb
    "", //agent
    activityId, //activity
    "", //registration
    "", //sessionid
    since,
    until,
    relatedactivities, //relatedactivities
    relatedagents, //relatedagents
    "", //format
    "", //page
    true, //more
    "", //extensionsActivityId
    statementsCount
  );
  if (qStored) selection.unshift(...stmtsQ);
  // remove duplicates
  const selection_ = selection.filter(
    (obj, index, self) => index === self.findIndex((item) => item.id === obj.id)
  );
  // push relevant information of selected statements to data object
  return selection_;
}
// array: colors for echarts dashboards
var colorList = [
  "#c12e34",
  "#e6b600",
  "#0098d9",
  "#2b821d",
  "#005eaa",
  "#339ca8",
  "#cda819",
  "#32a487"
];
// function: get actor in browse mode for echarts dashboards to exclude actor in queries
function getActorInBrowseMode() {
  let actor = "";
  if (enableAuthorLA)
  //if (constStates.launchMode.toUpperCase() === "BROWSE")
    actor = "' and actor.account.name != '" + cmi5Controller.agent.account.name;
  return actor;
}
/* function loadSpeechBubbles(speechbubbl) {
  for (let i = 0; i < speechbubbl.length; i++) {
    if (
      document.querySelector(".bubble-col.b-index" + i + " .ce-html") &&
      !document.querySelector(
        ".bubble-col.b-index" + i + " .ce-html.ce-html-mh"
      )
    )
      document
        .querySelector(".bubble-col.b-index" + i + " .ce-html")
        .classList.add("ce-html-mh");
    var canvasCenter1 =
      '<div class=" fsc-default ce-html d-none d-md-block position-relative"><div class="canvas-center1"><canvas id="canvas1_' +
      i +
      '" width="738" height="400" class="lower-canvas" ></canvas></div></div><div class=" fsc-default ce-html d-block d-md-none position-relative"><div class="canvas-center2"><canvas id="canvas2_' +
      i +
      '" width="516" height="500" class="lower-canvas" ></canvas></div></div>';
    if (sessionStorage.getItem("cmi5No") === "true" && enableCanvasEdit) {
      canvasCenter1 =
        '<div class=" fsc-default ce-html d-none d-md-block position-relative"><div class="canvas-center1"><canvas id="canvas1_' +
        i +
        '" width="738" height="400" class="lower-canvas" ></canvas></div><button id="edit1_' +
        i +
        '" class="btn canvas-btn btn-secondary">Edit</button><button id="save1_' +
        i +
        '" class="btn canvas-btn btn-secondary">Save</button></div><div class=" fsc-default ce-html d-block d-md-none position-relative"><div class="canvas-center2"><canvas id="canvas2_' +
        i +
        '" width="516" height="500" class="lower-canvas" ></canvas></div><button id="edit2_' +
        i +
        '" class="btn canvas-btn btn-secondary">Edit</button><button id="save2_' +
        i +
        '" class="btn canvas-btn btn-secondary">Save</button></div>';
    }
    document
      .querySelector(".bubble-col.b-index" + i)
      .insertAdjacentHTML("beforeend", canvasCenter1);
    handleBubble(1, i, enableCanvasEdit);
    handleBubble(2, i, enableCanvasEdit);
  }
} */

function loadSpeechBubbles(speechBubbles) {
  for (let i = 0; i < speechBubbles.length; i++) {
    const bubbleColSelector = `.bubble-col.b-index${i}`;
    const ceHtmlSelector = `${bubbleColSelector} .ce-html`;
    const ceHtmlElement = document.querySelector(ceHtmlSelector);

    if (ceHtmlElement && !ceHtmlElement.classList.contains('ce-html-mh')) {
      ceHtmlElement.classList.add('ce-html-mh');
    }

    const enableEditButtons =
      sessionStorage.getItem('cmi5No') === 'true' && enableCanvasEdit;

    const canvasHtml = `
      <div class="fsc-default ce-html d-none d-md-block position-relative">
        <div class="canvas-center1">
          <canvas id="canvas1_${i}" width="738" height="400" class="lower-canvas"></canvas>
        </div>
        ${
          enableEditButtons
            ? `<button id="edit1_${i}" class="btn canvas-btn btn-secondary">Edit</button>
               <button id="save1_${i}" class="btn canvas-btn btn-secondary">Save</button>`
            : ''
        }
      </div>
      <div class="fsc-default ce-html d-block d-md-none position-relative">
        <div class="canvas-center2">
          <canvas id="canvas2_${i}" width="516" height="500" class="lower-canvas"></canvas>
        </div>
        ${
          enableEditButtons
            ? `<button id="edit2_${i}" class="btn canvas-btn btn-secondary">Edit</button>
               <button id="save2_${i}" class="btn canvas-btn btn-secondary">Save</button>`
            : ''
        }
      </div>
    `;

    document
      .querySelector(bubbleColSelector)
      .insertAdjacentHTML('beforeend', canvasHtml);

    handleBubble(1, i, enableCanvasEdit);
    handleBubble(2, i, enableCanvasEdit);
  }
}
function showHideRateButton(time) {
  if (!time) time = 0;
  setTimeout(() => {
    if (H5PIntegration.contents && document.querySelector(".poll button")) {
      let cids = H5PIntegration.contents,
        cstate = [];
      for (let i = 0; i < Object.keys(cids).length; i++) {
        if (cids[Object.keys(cids)[i]].hasOwnProperty("contentUserData"))
          cstate[i] = JSON.parse(
            cids[Object.keys(cids)[i]].contentUserData[0].state
          );
        if (
          cids[Object.keys(cids)[i]].hasOwnProperty("contentUserData") &&
          cstate[i].questions &&
          cstate[i].progress &&
          cstate[i].questions.length === cstate[i].progress + 1 &&
          cids[Object.keys(cids)[i]].library.includes("H5P.Questionnaire")
        ) {
          document.querySelector(".poll button").classList.remove("d-none");
          break;
        } else document.querySelector(".poll button").classList.add("d-none");
      }
    }
  }, time);
}
// get info on device and window
function getDeviceInfo() {
  try {
    const userAgent = navigator.userAgent;
    const maxTouchPoints = navigator.maxTouchPoints;
    const hardwareConcurrency = navigator.hardwareConcurrency;
    const screenOrientation = window.screen.orientation?.type;
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;
    const innerHeight = window.innerHeight;
    const innerWidth = window.innerWidth;
    return `User Agent: ${userAgent}, Max Touch Points: ${maxTouchPoints}, Hardware Concurrency: ${hardwareConcurrency}, Window Screen Orientation: ${screenOrientation}, Window Screen Size: H ${screenHeight} x W ${screenWidth}, Window Inner Size: H ${innerHeight} x W ${innerWidth}`;
  } catch (error) {
    console.error("Error getting device info:", error);
    return "Device information not available.";
  }
}
// check if page is scrolled down completely - if page is not completly visited, prevent go to new page
function pageCompleted(event, navLink) {
  // Helper function to show an alert and prevent navigation
  function showIncompleteAlert(event) {
    userAlerts("pageincomplete");
    document.querySelector("button.btn-close").click();
    event.preventDefault();
  }

  // Helper function to check if an array contains only empty values
  function isArrayOnlyEmptyValues(arr) {
    return arr.every(
      (value) => value === null || value === undefined || value === ""
    );
  }

  // Handle glossary links separately
  if (
    navLink.classList.contains("dpnglossary") &&
    !navLink.classList.contains("btn")
  ) {
    sessionStorage.setItem("glossarybacklink", location.href);
    sendAllowedStatementWrapper("Viewed", "", "", "", "", navLink.innerHTML);
    return; // No need to check page completion for glossary links
  }

  // Determine if we should check for page completion
  const isNotStartPage = constStates.startPageId !== document.body.id;
  const isNotPrevPage = !navLink.parentElement.classList.contains("prev-page");
  const isNotGlossaryDetails = !navLink.classList.contains("dpnglossary.details");
  const isNotResumeButton = !navLink.classList.contains("resume-button");
  const isNotStartButton = !navLink.classList.contains("start-button");
  const isNotGlossary = !navLink.classList.contains("dpnglossary");

  if (
    isNotStartPage &&
    isNotPrevPage &&
    isNotGlossaryDetails &&
    isNotResumeButton &&
    isNotStartButton &&
    isNotGlossary
  ) {
    // Check page completion
    const pagesVisited = JSON.parse(sessionStorage.getItem("pagesVisited") || "[]");
    if (pagesVisited.length === 0) {
      // No pages visited, cannot check completion
      return;
    }

    let currentPageEntry = pagesVisited[0];
    let currentPage, currentPageProgress;

    // Extract current page and progress
    if (currentPageEntry) {
      const vpIndex = currentPageEntry.indexOf("__vp__");
      if (vpIndex !== -1) {
        currentPage = currentPageEntry.substring(0, vpIndex);
        currentPageProgress = parseFloat(currentPageEntry.substring(vpIndex + 6));
      } else {
        currentPage = currentPageEntry;
        currentPageProgress = 0;
      }
    } else {
      // No current page info
      return;
    }
    // Check if there are videos to be watched
    let videosExist = false;
    let videosWatchedCount = 0;
    if (cmi5Controller.hasOwnProperty("videos") && cmi5Controller.videos.length > 0) videosExist = true;
    // Initialize H5P missing flag
    let h5pIncomplete = false;
    // Loop over sessionStorage keys to check videos and H5P interactions
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      // Check videos
      if (videosExist) {
        let currentPageString;
        let youtubeLinkIndex = key.indexOf("https://www.youtube.com");
        let videoLinkIndex = key.indexOf(location.hostname + "/fileadmin");
        if (youtubeLinkIndex !== -1) {
          currentPageString = key.substring(0, youtubeLinkIndex - 1);
        }
        else if (videoLinkIndex !== -1) {
          currentPageString = key.substring(0, videoLinkIndex - 9);
        }
        const videoKey = `video___${location.hostname}${currentPage}`;
        if (currentPageString === videoKey) {
          videosWatchedCount++;
        }
      }
      // Check H5P interactions
      const h5pKeyPrefix = `h5p-state___${currentPage}/h5pcid_`;
      if (key.startsWith(h5pKeyPrefix)) {
        const h5pStateValue = JSON.parse(sessionStorage.getItem(key));
        if (
          (h5pStateValue && Array.isArray(h5pStateValue) && isArrayOnlyEmptyValues(h5pStateValue)) ||
          (h5pStateValue && h5pStateValue.length === 0) ||
          (h5pStateValue && h5pStateValue.progress === 0) ||
          (h5pStateValue && h5pStateValue.answers && h5pStateValue.answers.length === 0)
        ) {
          h5pIncomplete = true;
          //break;
        }
      }
    }
    // Determine if page is incomplete
    const videosIncomplete = videosExist && videosWatchedCount < cmi5Controller.videos.length;
    const pageNotFullyScrolled = currentPageProgress < 100;
    if (videosIncomplete || h5pIncomplete || pageNotFullyScrolled) {
      showIncompleteAlert(event);
    }
  }
}

function documentToolClickDownload() {
  if (document.querySelector("#h5p-iframe-" + documentationtoolCid)) {
    let dtIframe = document.querySelector("#h5p-iframe-" + documentationtoolCid);
    dtIframe = dtIframe.contentDocument || dtIframe.contentWindow.document;
    if (
      dtIframe &&
      dtIframe.querySelector(
        ".h5p-documentation-tool-page.current .h5p-document-export-page"
      )
    ) {
      dtIframe
        .querySelector(".joubel-simple-rounded-button.export-document-button")
        .addEventListener("click", function () {
          setTimeout(() => {
            dtIframe
              .querySelector(".joubel-exportable-export-button")
              .addEventListener("click", function () {
                sendAllowedStatementWrapper("downloaded");
              });
          }, 200);
        });
    }
  }
}

function addButton_(index, label) {
  document
    .querySelector(".poll")
    .insertAdjacentHTML(
      "afterbegin",
      '<button type="button" class="d-none btn-celabel' +
        index +
        ' fabx btn btn-primary" data-bs-toggle="modal" data-bs-target="#canvasModal">LA</button>'
    );
  document
    .querySelector(".poll")
    .querySelector(".btn-celabel" + index).innerHTML = label;
  if (document.querySelector(".echarts-title > p"))
    cmi5Controller.ecTitle = document
      .querySelector(".echarts-title > p")
      .innerText.replace(/[\n\r]+|[\s]{2,}/g, " ")
      .trim();
}

function monkeyH5p() {
  if (typeof H5P === "undefined") return;
  let initializationCount = 0,
    ps,
    index;
  // Determine the current page index
  index = getCurrentPageIndex();
  // If projectId is 'spi', use 'schrittnr' from sessionStorage
  if (projectId === "spi") index = parseInt(sessionStorage.getItem("schrittnr"), 10);
  // Set H5P save frequency
  H5PIntegration.saveFreq = 1;
  // Wrap H5PIntegration in a Proxy to intercept property access
  H5PIntegration = new Proxy(H5PIntegration, {
    get(target, propKey, receiver) {
      if (propKey === "contents") {
        // Define contentIds inside the get handler
        const contentIds = Object.keys(target.contents);
        handleH5pContents(target, contentIds, index);
      }
      return Reflect.get(target, propKey, receiver);
    },
  });

  // Function to handle H5P contents
  function handleH5pContents(target, contentIds, pageIndex) {
    for (const cid of contentIds) {
      const content = target.contents[cid];

      if (initializationCount < contentIds.length) {
        initializationCount++;
        // Add custom CSS styles based on projectId
        content.styles.push("/fileadmin/h5p/custom-" + projectId + ".css");
        content.styles = [...new Set(content.styles)];
        content.scripts = [...new Set(content.scripts)];
        initializeContentUserData(content);

        // Get documentation tool CID if not already set
        if (!documentationtoolCid) {
          documentationtoolCid = getDocumentationToolCid();
        }

        if (cid === `cid-${documentationtoolCid}`) {
          // Handle documentation tool content
          handleDocumentationToolContent(content, pageIndex);
        } else {
          // Load state from sessionStorage for other content
          content.contentUserData[0].state = sessionStorage.getItem(
            `h5p-state___${location.pathname}/h5pcid_${cid.slice(4)}`
          );
        }
      } else {
        // Save content state back to sessionStorage
        saveContentState(content, cid);
      }
    }
  }

  // Function to initialize content user data
  function initializeContentUserData(content) {
    content.contentUserData = [];
    content.contentUserData[0] = [];
  }

  // Function to get the documentation tool CID
  function getDocumentationToolCid() {
    const reflexionsElement = document.querySelector(".reflexions-fragen .h5p-iframe-wrapper iframe");
    if (reflexionsElement) {
      return reflexionsElement.getAttribute("data-content-id");
    }
    return documentationtoolCid;
  }

  // Function to handle documentation tool content
  function handleDocumentationToolContent(content, pageIndex) {
    const stateKey = `h5p-state___/h5pcid_${documentationtoolCid}`;
    content.contentUserData[0].state = sessionStorage.getItem(stateKey);

    if (projectId) {
      ps = JSON.parse(content.contentUserData[0].state);
      if (ps) {
        ps.previousPage = pageIndex;
        content.contentUserData[0].state = JSON.stringify(ps);
      } else {
        // Retry after a delay if state is not yet available
        setTimeout(() => {
          if (content.contentUserData) {
            ps = JSON.parse(content.contentUserData[0].state);
            ps.previousPage = pageIndex;
            content.contentUserData[0].state = JSON.stringify(ps);
          }
        }, 1000);
      }
    }
  }

  // Function to save content state to sessionStorage
  function saveContentState(content, cid) {
    if (cid === `cid-${documentationtoolCid}` && content.contentUserData) {
      sessionStorage.setItem(
        `h5p-state___/h5pcid_${documentationtoolCid}`,
        content.contentUserData[0].state
      );
    } else if (content.contentUserData) {
      sessionStorage.setItem(
        `h5p-state___${location.pathname}/h5pcid_${cid.slice(4)}`,
        content.contentUserData[0].state
      );
    }
  }
}

// Helper function to get the current page index
function getCurrentPageIndex() {
  const menuItems = document.querySelectorAll(".main-navbarnav a[target=_self]");
  for (let i = 1; i < menuItems.length; i++) {
    if (menuItems[i].classList.contains("active")) {
      return i - 1;
    }
  }
  return null;
}
