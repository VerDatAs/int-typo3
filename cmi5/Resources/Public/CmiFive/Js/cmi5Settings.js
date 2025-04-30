function cmi5Settings(s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11) {
  // Grab the main container once and reuse
  const mainEl = document.querySelector('#page-content main');
  
  // Hide all .pagination elements
  document.querySelectorAll('.pagination').forEach((pagination) => {
    pagination.classList.add('d-none');
  });

  // Insert a hidden textarea for parsed XML
  mainEl.insertAdjacentHTML('beforeend', `
    <textarea class="parsedxml" style="width:100%" rows="10"></textarea>
  `);

  // Construct settings object
  const settings = {
    cmiObjpropLang: s1,
    cmiDatamodelAuActtype: s2,
    cmiDatamodelAuTitle: s3,
    cmiDatamodelAuDescr: s4,
    cmiDatamodelAuId: s5,
    cmiDatamodelAuMoveon: s6,
    cmiDatamodelAuMasteryscore: s7,
    cmiDatamodelCourseTitle: s8,
    cmiDatamodelCourseDescr: s9,
    cmiDatamodelCourseId: s10,
    cmiDatamodelAuLaunchmethod: s11,
  };

  // Check for invalid activity type
  if (settings.cmiDatamodelAuActtype === 0) {
    alert("Please select a valid Activity Type in cmi5 Settings!");
  }

  // Define required fields and their default placeholders
  const requiredFields = {
    cmiDatamodelAuTitle: "### valid AU Title required here ###",
    cmiDatamodelAuId: "### valid AU ID required here ###",
    cmiDatamodelAuMoveon: "### valid moveOn Criteria required here ###",
    cmiDatamodelCourseTitle: "### valid Course Title required here ###",
    cmiDatamodelCourseId: "### valid Course ID required here ###",
    cmiObjpropLang: "### valid Language Tag required here ###",
  };

  // Replace any required field that is '0' with the placeholder
  Object.entries(requiredFields).forEach(([key, placeholder]) => {
    if (settings[key] === 0) {
      settings[key] = placeholder;
    }
  });

  // Insert form controls
  mainEl.insertAdjacentHTML('beforeend', `
    <div class="input-group mb-3">
      <span class="input-group-text cmi5-au-title">Titel</span>
      <input
        type="text"
        id="cmi5-au-title"
        class="form-control"
        value="Titel"
        placeholder="Titel"
        aria-label="Titel"
        aria-describedby="cmi5-au-title"
      />
    </div>
    <div class="input-group mb-3">
      <span class="input-group-text cmi5-au-description">Beschreibung</span>
      <input
        type="text"
        id="cmi5-au-description"
        class="form-control"
        value="Beschreibung"
        placeholder="Beschreibung"
        aria-label="Beschreibung"
        aria-describedby="cmi5-au-description"
      />
    </div>

    <div class="row">
      <div class="col">
        <div class="input-group mb-3">
          <span class="input-group-text cmi5-activity-type" id="cmi5-activity-type">Lernaktivität</span>
          <select class="form-select cmi5-activity-type" aria-label=".form-select-sm example">
            <option value="http://adlnet.gov/expapi/activities/module">Lernmodul</option>
            <option value="http://adlnet.gov/expapi/activities/course">Kurs</option>
            <option value="http://activitystrea.ms/schema/1.0/task">Aufgabe</option>
            <option value="http://adlnet.gov/expapi/activities/assessment">Test</option>
          </select>
        </div>
      </div>
      <div class="col">
        <div class="mb-3 input-group">
          <span class="input-group-text cmi5-language" id="cmi5-language">Sprache</span>
          <select class="form-select cmi5-language" aria-label=".form-select-sm example">
            <option value="de-DE">Deutsch</option>
            <option value="en-EN">Englisch</option>
            <option value="fr-FR">Französich</option>
            <option value="es-ES">Spanisch</option>
          </select>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div class="mb-3 input-group">
          <span class="input-group-text cmi5-moveon" id="cmi5-moveon">MoveOn Kriterium</span>
          <select class="form-select cmi5-moveon" aria-label=".form-select-sm example">
            <option value="Completed">Completed</option>
            <option value="Passed">Passed</option>
            <option value="CompletedAndPassed">Completed and Passed</option>
            <option value="CompletedOrPassed">Completed or Passed</option>
            <option value="NotApplicable">Not applicable</option>
          </select>
        </div>
      </div>
      <div class="col">
        <div class="mb-3 input-group">
          <span class="input-group-text cmi5-mastery-score">Mastery Score</span>
          <input
            type="text"
            id="cmi5-mastery-score"
            class="text-end form-control"
            value="75"
            placeholder="75"
            aria-label="75"
            aria-describedby="cmi5-mastery-score"
          />
          <span class="input-group-text">%</span>
        </div>
      </div>
    </div>

    <div class="mb-3 input-group">
      <span class="input-group-text cmi5-launch-mode" id="cmi5-launch-mode">Startmodus</span>
      <select class="form-select cmi5-launch-mode" aria-label=".form-select-sm example">
        <option value="OwnWindow" selected>Eigenes Fenster</option>
        <option value="AnyWindow">Neues Fenster</option>
      </select>
    </div>
    <div class="mb-3 input-group">
      <span class="input-group-text cmi5-au-id">ID</span>
      <input
        type="text"
        id="cmi5-au-id"
        class="form-control"
        value="http://www.example.com/identifiers/course/AU/xxx-xxx-xxx"
        placeholder="http://www.example.com/identifiers/course/AU/xxx-xxx-xxx"
        aria-label="http://www.example.com/identifiers/course/AU/xxx-xxx-xxx"
        aria-describedby="cmi5-au-id"
      />
    </div>
    <div class="pb-3"></div>
  `);

  // Hide and populate the parsed XML textarea
  const parsedXmlArea = document.querySelector('.parsedxml');
  if (parsedXmlArea) {
    parsedXmlArea.classList.add('d-none');
    parsedXmlArea.innerHTML = cmi5Xml(settings);  // Assume cmi5Xml() is defined
  }

  // Store some properties in sessionStorage
  sessionStorage.setItem(
    "cmi5ObjectProperties",
    JSON.stringify([
      settings.cmiObjpropLang,
      settings.cmiDatamodelAuActtype,
      settings.cmiDatamodelAuTitle,
      settings.cmiDatamodelAuDescr
    ])
  );

  // Insert "Datei speichern" button and attach click handler
  mainEl.insertAdjacentHTML('beforeend', `
    <button class="btn btn-warning btn-lg" id="save-button">Datei speichern</button>
  `);

  const saveButton = document.getElementById('save-button');
  if (saveButton) {
    saveButton.addEventListener('click', saveFileAs); // Assume saveFileAs() is defined
  }
}
