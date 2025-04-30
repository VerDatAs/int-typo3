function handleBubble(breakpoint, index, enableCanvasEdit) {
  var boxPadding = 16,
    arrowWidth = 80,
    strokeWidth = 0,
    handleSize = 24,
    canvas,
    saved = false,
    msg = document.querySelector(
      ".bubble-text.b-index" + index + " p"
    ).innerHTML,
    tw = 180,
    th = 16,
    fs = 16,
    //init = true,
    hl = 128,
    ht = 169,
    it = 10,
    il = 10,
    ih = 966,
    iw = 966,
    ix = 0.4,
    iy = 0.4,
    cvs = "canvas" + breakpoint + "_" + index,
    svd = "saved" + breakpoint + "_" + index,
    bp = breakpoint - 1,
    bubble = false,
    resizeCanvas = "resizeCanvas" + breakpoint + "_" + index,
    tb = [],
    tb_ = [{}, {}],
    imgElement = document.querySelector(
      ".bubble-img.b-index" + index + " img"
    ).src,
    avatar,
    avatarImg = new Image(),
    sBubbleSt = "sBubbleData_" + index;

  msg = msg.replace(/<[^>]*>/g, "");
  if (!sessionStorage.getItem(sBubbleSt))
    sessionStorage.setItem(sBubbleSt, JSON.stringify(tb_));

  resizeCanvas = function () {
    if (bubble) {
      const outerCanvasContainer = document.querySelector(
        ".canvas-center" + breakpoint
      );
      const ratio = canvas.getWidth() / canvas.getHeight();
      const containerWidth = outerCanvasContainer.clientWidth;
      const containerHeight = outerCanvasContainer.clientHeight;
      const scale = containerWidth / canvas.getWidth();
      const zoom = canvas.getZoom() * scale;
      if (zoom && ratio) {
        canvas.setDimensions({
          width: containerWidth,
          height: containerWidth / ratio
        });
        canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
      }
    }
  };

  if (breakpoint === 1) hl = 0;
  else if (breakpoint === 2) ht = 0;

  if (sessionStorage.getItem(sBubbleSt) && JSON.parse(sessionStorage.getItem(sBubbleSt))[bp].length > 1) {
    tb = JSON.parse(sessionStorage.getItem(sBubbleSt))[bp];
    fs = tb[4];
    tw = tb[5].width;
    th = tb[5].height;
    hl = tb[2];
    ht = tb[3];
    il = tb[8];
    it = tb[9];
    iw = tb[10];
    ih = tb[11];
    ix = tb[12];
    iy = tb[13];
    saved = tb[14];
  }

  if (
    (((sessionStorage.getItem(svd) && sessionStorage.getItem(svd) === "true") ||
    (JSON.parse(sessionStorage.getItem(sBubbleSt))[bp].length > 1 && saved)) && enableCanvasEdit)
  ) {
    saved = false;
    canvas = new fabric.Canvas(cvs);
  } else {
    saved = true;
    canvas = new fabric.StaticCanvas(cvs);
  }

  canvas.backgroundColor = "#ffe9c8";
  avatarImg.src = imgElement;
  avatarImg.addEventListener("load", function () {
    avatar = new fabric.Image(avatarImg, {
      cropX: 0,
      cropY: 0,
      //width: iw,
      //height: ih,
      left: il,
      top: it,
      scaleX: ix * 0.75,
      scaleY: iy * 0.75,
      width: avatarImg.width,
      height: avatarImg.height
    });
    canvas.add(avatar);
    canvas.sendToBack(avatar);
    avatar.on({
      moving: imgMoveHandler,
      scaling: imgMoveHandler
    });
  });
  var textbox = new fabric.Textbox(msg, {
    id: "textbox",
    lockRotation: true,
    left: 200,
    top: 80,
    width: tw,
    height: th,
    fontSize: fs,
    //fontStyle: "italic",
    fontWeight: "600",
    fill: "#7c4d25",
    originY: "center",
    originX: "center",
    editable: false,
    fontFamily: "Comic Neue"
  });

  textbox.setControlsVisibility({ mt: false, mb: false, mtr: false });

  textbox.on({ scaling: moveHandler });

  //call setCoords whenever the textbox moved
  var setCoords = textbox.setCoords.bind(textbox);
  textbox.on({
    moving: setCoords,
    scaling: setCoords
  });

  //to detect changes in the textbox position and update the handle when the textbox was moved, let's store the last known coords
  textbox.lastLeft = textbox.left;
  textbox.lastTop = textbox.top;

  if (JSON.parse(sessionStorage.getItem(sBubbleSt))[bp].length > 1) {
    textbox.left = tb[0];
    textbox.top = tb[1];
    textbox.fontSize = fs;
    textbox.lastLeft = [15];
    textbox.lastTop = [16];
  }

  //speech bubble tail handle
  var handle = new fabric.Rect({
    id: "handle",
    fill: "transparent",
    left: hl,
    top: ht,
    width: handleSize,
    height: handleSize,
    hasRotatingPoint: false,
    hasControls: false,
    originY: "center",
    originX: "center"
  });

  //speech bubble background box
  var rect = new fabric.Rect({
    id: "rect",
    fill: "white",
    stroke: "black",
    strokeWidth: strokeWidth,
    rx: 8,
    ry: 8,
    objectCaching: false
  });

  //speech bubble tail polygon
  var poly = new fabric.Polygon(
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 0 }
    ],
    {
      id: "poly",
      fill: "white",
      stroke: "black",
      strokeWidth: strokeWidth,
      objectCaching: false
    }
  );

  //2nd tail poly to overlay the bubble stroke
  var poly2 = new fabric.Polygon(
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 0 }
    ],
    {
      id: "poly2",
      fill: "white",
      objectCaching: false
    }
  );
  canvas.add(poly, rect, poly2, textbox, handle);
  document.fonts.ready.then(function () {
    canvas.requestRenderAll();
    canvas.on("after:render", updateBubble);
    if (!bubble) {
      updateBubble();
      if (!saved) canvas.setActiveObject(textbox, handle);
    }
    if (saved) groupBubble();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  });

  function updateBubble(evt) {
    if (!bubble) {
      //lets spare us some typing
      let x = textbox.left,
        y = textbox.top,
        bound = textbox.getBoundingRect();
      rect.left = bound.left - boxPadding;
      rect.top = bound.top - boxPadding;
      rect.width = bound.width + boxPadding * 2;
      rect.height = bound.height + boxPadding * 2;

      //if the textbox was moved, update the handle position too
      // if (init) {
      //   handle.left += x - textbox.lastLeft;
      //   handle.top += y - textbox.lastTop;
      //   handle.setCoords();
      //   init = false;
      // }

      //to support 360° thick tails we have to do some triangulation
      var halfPi = Math.PI / 2;
      var angleRadians = Math.atan2(handle.top - y, handle.left - x);
      var offsetX = Math.cos(angleRadians + halfPi);
      var offsetY = Math.sin(angleRadians + halfPi);

      //update tail poly
      if (sessionStorage.getItem(sBubbleSt) && JSON.parse(sessionStorage.getItem(sBubbleSt))[bp].length > 1) {
        poly.points = JSON.parse(sessionStorage.getItem(sBubbleSt))[bp][6];
        poly2.points = JSON.parse(sessionStorage.getItem(sBubbleSt))[bp][7];
      }
      poly.points[0].x = handle.left;
      poly.points[0].y = handle.top;
      poly.points[1].x = x - offsetX * arrowWidth;
      poly.points[1].y = y - offsetY * arrowWidth;
      poly.points[2].x = x + offsetX * arrowWidth;
      poly.points[2].y = y + offsetY * arrowWidth;

      //white overlay poly (prevent dividing line)
      var halfStroke = strokeWidth / 2;
      poly2.points[0].x = handle.left;
      poly2.points[0].y = handle.top;
      poly2.points[1].x = x - offsetX * (arrowWidth - halfStroke);
      poly2.points[1].y = y - offsetY * (arrowWidth - halfStroke);
      poly2.points[2].x = x + offsetX * (arrowWidth - halfStroke);
      poly2.points[2].y = y + offsetY * (arrowWidth - halfStroke);

      //remember current position to detect further changes
      textbox.lastLeft = x;
      textbox.lastTop = y;
      tb = [];
      tb.push(x, y, handle.left, handle.top, textbox.fontSize, textbox.getBoundingRect(), poly.points, poly2.points, il, it, iw, ih, ix, iy, saved, textbox.lastLeft, textbox.lastTop);
      tb_ = JSON.parse(sessionStorage.getItem(sBubbleSt));
      tb_[bp] = tb;
      sessionStorage.setItem(sBubbleSt, JSON.stringify(tb_));
    }
  }
  if (sessionStorage.getItem("cmi5No") === "true" && enableCanvasEdit) {
    document
      .querySelector("#edit" + breakpoint + "_" + index)
      .addEventListener("click", function () {
        sessionStorage.setItem(svd, "false");
        saved = false;
        if (bubble) {
          let items = bubble._objects;
          bubble._restoreObjectsState();
          for (let i = 0; i < items.length; i++) {
            if (items[i].id === "poly") {
              poly = items[i];
              canvas.remove(items[i]);
            }
            if (items[i].id === "rect") {
              rect = items[i];
              canvas.remove(items[i]);
            }
            if (items[i].id === "poly2") {
              poly2 = items[i];
              canvas.remove(items[i]);
            }
            if (items[i].id === "textbox") {
              textbox = items[i];
              canvas.remove(items[i]);
            }
            if (items[i].id === "handle") {
              handle = items[i];
              canvas.remove(items[i]);
            }
          }
          canvas.remove(bubble);
          bubble = null;
          canvas.add(poly, rect, poly2, textbox, handle);
          setTimeout(() => {
            location.reload();
          }, 0);
        }
      });
    document
      .querySelector("#save" + breakpoint + "_" + index)
      .addEventListener("click", function () {
        sessionStorage.setItem(svd, "true");
        groupBubble();
        location.reload();
      });
  }
  function groupBubble() {
    if (!bubble) {
      bubble = new fabric.Group([poly, rect, poly2, textbox, handle]);
      canvas.add(bubble);
    }
  }
  function moveHandler(evt) {
    evt.target.fontSize *= evt.target.scaleX;
  }
  function imgMoveHandler(evt) {
    il = evt.target.left;
    it = evt.target.top;
    iw = evt.target.width;
    ih = evt.target.height;
    ix = evt.target.scaleX;
    iy = evt.target.scaleY;
  }
}
