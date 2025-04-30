/**
 * Prompts user to name and save a ZIP containing the "cmi5.xml" file.
 */
function saveFileAs() {
  const pageTitleElement = document.querySelector(".page-title h1");
  if (!pageTitleElement) {
    console.warn("Cannot find .page-title h1 element.");
    return;
  }

  // Derive the base filename from the page title, removing trailing " (Lerngruppe..."
  let zipName = pageTitleElement.textContent.trim();
  const groupIndex = zipName.indexOf(" (Lerngruppe");
  if (groupIndex !== -1) {
    zipName = zipName.substring(0, groupIndex);
  }
  // Convert any German umlauts, punctuation, spaces, etc.
  zipName = deUmlaut(zipName);

  // Prompt user for the final filename
  const promptFilename = prompt("Datei speichern", `${zipName}_cmi5.zip`);
  if (!promptFilename) {
    return; // User canceled
  }

  // Build and save the ZIP
  const zip = new JSZip();
  const parsedXml = document.querySelector(".parsedxml")?.value;
  zip.file("cmi5.xml", parsedXml || "");

  zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(blob, promptFilename);
  });
}

/**
 * Initializes and updates the cmi5 XML content based on the given settings,
 * then wires up all relevant event listeners to dynamically regenerate XML.
 *
 * @param {Object} settings - The configuration for generating cmi5 XML.
 * @returns {string}        - The initial XML string
 */
function cmi5Xml(settings) {
  const pageTitleElement = document.querySelector(".page-title h1");
  if (!pageTitleElement) {
    console.warn("Cannot find .page-title h1 element.");
    return "";
  }

  // Trim page title and remove any trailing " (Lerngruppe..."
  let pageTitle = pageTitleElement.textContent.trim();
  const groupIndex = pageTitle.indexOf(" (Lerngruppe");
  if (groupIndex !== -1) {
    pageTitle = pageTitle.substring(0, groupIndex);
  }

  // Set default course/AU titles & descriptions if they are "0"
  settings.cmiDatamodelCourseTitle = pageTitle;
  if (settings.cmiDatamodelCourseDescr === "0") {
    settings.cmiDatamodelCourseDescr = pageTitle;
  }
  settings.cmiDatamodelAuTitle = pageTitle;
  if (settings.cmiDatamodelAuDescr === "0") {
    settings.cmiDatamodelAuDescr = pageTitle;
  }

  // Update form fields with derived defaults
  const auTitleEl = document.querySelector("#cmi5-au-title");
  const auDescrEl = document.querySelector("#cmi5-au-description");
  const auIdEl = document.querySelector("#cmi5-au-id");
  const masteryScoreEl = document.querySelector("#cmi5-mastery-score");

  if (auTitleEl) auTitleEl.value = pageTitle;
  if (auDescrEl) auDescrEl.value = settings.cmiDatamodelCourseDescr;
  if (auIdEl) {
    const baseId = settings.cmiDatamodelAuId.substring(
      0,
      settings.cmiDatamodelAuId.indexOf("xxx")
    );
    auIdEl.value = baseId + deUmlaut(pageTitle);
  }
  if (masteryScoreEl) {
    masteryScoreEl.value = settings.cmiDatamodelAuMasteryscore * 100;
  }

  // Helper to mark the correct <option> as selected
  function setSelectedOption(selector, settingsValue) {
    const options = document.querySelectorAll(selector);
    options.forEach((option) => {
      option.removeAttribute("selected");
      if (option.value === settingsValue) {
        option.setAttribute("selected", "");
      }
    });
  }

  // Select the currently-chosen options in dropdowns
  setSelectedOption(".form-select.cmi5-language option", settings.cmiObjpropLang);
  setSelectedOption(".form-select.cmi5-activity-type option", settings.cmiDatamodelAuActtype);
  setSelectedOption(".form-select.cmi5-moveon option", settings.cmiDatamodelAuMoveon);
  setSelectedOption(".form-select.cmi5-launch-mode option", settings.cmiDatamodelAuLaunchmethod);

  // Build an XML string directly using template literals.
  function generateXml() {
    const courseIdBase = settings.cmiDatamodelCourseId.substring(
      0, 
      settings.cmiDatamodelCourseId.indexOf("xxx")
    );
    const auIdBase = settings.cmiDatamodelAuId.substring(
      0, 
      settings.cmiDatamodelAuId.indexOf("xxx")
    );

    // Important: If user inputs can contain angle brackets (<, >) or ampersands (&),
    // consider escaping them here.
    // Basic XML escape approach:
    // const safeTitle = settings.cmiDatamodelCourseTitle
    //   .replaceAll("&", "&amp;")
    //   .replaceAll("<", "&lt;")
    //   .replaceAll(">", "&gt;");
    // ...and so on.

    // This is the raw XML string we output
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<courseStructure xmlns="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd">
  <course id="${courseIdBase + deUmlaut(pageTitle)}">
    <title>
      <langstring lang="${settings.cmiObjpropLang}">${settings.cmiDatamodelCourseTitle}</langstring>
    </title>
    <description>
      <langstring lang="${settings.cmiObjpropLang}">${settings.cmiDatamodelCourseDescr}</langstring>
    </description>
  </course>
  <au 
    id="${auIdBase + deUmlaut(pageTitle)}"
    moveOn="${settings.cmiDatamodelAuMoveon}"
    masteryScore="${settings.cmiDatamodelAuMasteryscore}"
    launchMethod="${settings.cmiDatamodelAuLaunchmethod}"
    activityType="${settings.cmiDatamodelAuActtype}"
  >
    <title>
      <langstring lang="${settings.cmiObjpropLang}">${settings.cmiDatamodelAuTitle}</langstring>
    </title>
    <description>
      <langstring lang="${settings.cmiObjpropLang}">${settings.cmiDatamodelAuDescr}</langstring>
    </description>
    <url>${window.location.href}</url>
  </au>
</courseStructure>`;

    return xmlContent;
  }

  // Update .parsedxml textarea
  const parsedXmlEl = document.querySelector(".parsedxml");
  if (parsedXmlEl) {
    parsedXmlEl.value = generateXml();
  }

  // Event listeners for dynamic XML regeneration
  const languageSelect = document.querySelector(".form-select.cmi5-language");
  if (languageSelect) {
    languageSelect.addEventListener("change", () => {
      settings.cmiObjpropLang = languageSelect.value;
      if (parsedXmlEl) parsedXmlEl.value = generateXml();
    });
  }

  const activityTypeSelect = document.querySelector(".form-select.cmi5-activity-type");
  if (activityTypeSelect) {
    activityTypeSelect.addEventListener("change", () => {
      settings.cmiDatamodelAuActtype = activityTypeSelect.value;
      if (parsedXmlEl) parsedXmlEl.value = generateXml();
    });
  }

  const moveOnSelect = document.querySelector(".form-select.cmi5-moveon");
  if (moveOnSelect) {
    moveOnSelect.addEventListener("change", () => {
      settings.cmiDatamodelAuMoveon = moveOnSelect.value;
      if (parsedXmlEl) parsedXmlEl.value = generateXml();
    });
  }

  const launchModeSelect = document.querySelector(".form-select.cmi5-launch-mode");
  if (launchModeSelect) {
    launchModeSelect.addEventListener("change", () => {
      settings.cmiDatamodelAuLaunchmethod = launchModeSelect.value;
      if (parsedXmlEl) parsedXmlEl.value = generateXml();
    });
  }

  if (auTitleEl) {
    auTitleEl.addEventListener("change", () => {
      settings.cmiDatamodelAuTitle = auTitleEl.value;
      settings.cmiDatamodelCourseTitle = settings.cmiDatamodelAuTitle;
      if (parsedXmlEl) parsedXmlEl.value = generateXml();
    });
  }

  if (auDescrEl) {
    auDescrEl.addEventListener("change", () => {
      settings.cmiDatamodelAuDescr = auDescrEl.value;
      settings.cmiDatamodelCourseDescr = settings.cmiDatamodelAuDescr;
      if (parsedXmlEl) parsedXmlEl.value = generateXml();
    });
  }

  if (masteryScoreEl) {
    masteryScoreEl.addEventListener("change", () => {
      settings.cmiDatamodelAuMasteryscore = masteryScoreEl.value / 100;
      if (parsedXmlEl) parsedXmlEl.value = generateXml();
    });
  }

  // Return the final XML string in case you want it directly:
  return parsedXmlEl ? parsedXmlEl.value : "";
}

/**
 * Converts German umlauts and other special chars in a string
 * to more URL-friendly letters.
 *
 * @param {string} value - The string to process.
 * @returns {string} The processed string without umlauts, etc.
 */
function deUmlaut(value) {
  let output = value.toLowerCase();
  output = output.replace(/ä/g, "ae");
  output = output.replace(/ö/g, "oe");
  output = output.replace(/ü/g, "ue");
  output = output.replace(/ß/g, "ss");
  output = output.replace(/ /g, "-");
  output = output.replace(/\./g, "");
  output = output.replace(/,/g, "");
  output = output.replace(/\(/g, "");
  output = output.replace(/\)/g, "");
  return output;
}

/**
 * Utility function to programmatically trigger a download of the provided blob.
 *
 * @param {Blob} blob     - The file content to download.
 * @param {string} filename - The desired file name.
 */
function saveAs(blob, filename) {
  // For older MS browsers
  if (typeof navigator.msSaveOrOpenBlob !== "undefined") {
    return navigator.msSaveOrOpenBlob(blob, filename);
  } else if (typeof navigator.msSaveBlob !== "undefined") {
    return navigator.msSaveBlob(blob, filename);
  }

  // For modern browsers
  const elem = document.createElement("a");
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  elem.style.display = "none";

  (document.body || document.documentElement).appendChild(elem);
  if (typeof elem.click === "function") {
    elem.click();
  } else {
    // Fallback for some older browsers
    elem.target = "_blank";
    elem.dispatchEvent(
      new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true
      })
    );
  }
  URL.revokeObjectURL(elem.href);
}