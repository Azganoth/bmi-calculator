// Utils

/**
 * Parses the numeric value from an input element, handling non-numeric input by returning NaN.
 * @param {HTMLInputElement} input - The input element.
 * @returns {number} The parsed integer value, or NaN if invalid.
 */
function parseInputValue(input) {
  return parseInt(input.value);
}

/**
 * Checks if the value is a positive number (not NaN and greater than 0).
 * @param {number} value - The value to check.
 * @returns {boolean} True if positive, false otherwise.
 */
function isPositiveNumber(value) {
  return !Number.isNaN(value) && value > 0;
}

// Units

/**
 * Converts height from feet and inches to meters.
 * @param {number} feet - The number of feet.
 * @param {number} inches - The number of inches.
 * @returns {number} The height in meters.
 */
function toMetricHeight(feet, inches) {
  return (feet * 12 + inches) * 0.0254;
}

/**
 * Converts weight from stones and pounds to meters.
 * @param {number} stones - The number of stones.
 * @param {number} pounds - The number of pounds.
 * @returns {number} The weight in kilograms.
 */
function toMetricWeight(stones, pounds) {
  return (stones * 14 + pounds) * 0.453592;
}

/**
 * Converts height from meters to feet and inches.
 * @param {number} meters - The number of meters.
 * @returns {number} The height in feet and inches.
 */
function toImperialHeight(meters) {
  let feet = meters * 3.28084;
  return [Math.floor(feet), (feet % 1) * 12];
}

/**
 * Converts weight from kilograms to stones and pounds.
 * @param {number} kilograms - The number of kilograms.
 * @returns {number} The weight in stones and pounds.
 */
function toImperialWeight(kilograms) {
  let stones = kilograms / 6.3503;
  return [Math.floor(stones), (stones % 1) * 14];
}

// BMI

/**
 * Calculates the Body Mass Index (BMI).
 * @param {number} height - The height in meters.
 * @param {number} weight - The weight in kilograms.
 * @returns {number} The calculated BMI.
 */
function calculateBMI(height, weight) {
  return weight / (height * height);
}

// Calculator

let currentUnit = "metric";

const inputs = {
  metric: {
    height: document.getElementById("bmi-height"),
    weight: document.getElementById("bmi-weight"),
  },
  imperial: {
    height: {
      feet: document.getElementById("bmi-height-ft"),
      inches: document.getElementById("bmi-height-in"),
    },
    weight: {
      stones: document.getElementById("bmi-weight-st"),
      pounds: document.getElementById("bmi-weight-lbs"),
    },
  },
};

/**
 * Retrieves user input for height and weight in metric units (meters and kilograms).
 * @returns {[number, number]} An array containing the height in meters and weight in kilograms.
 */
function getMetricValues() {
  return [
    parseInputValue(inputs.metric.height) / 100,
    parseInputValue(inputs.metric.weight),
  ];
}

/**
 * Retrieves user input for height and weight in imperial units (feet, inches, stones, and pounds).
 * @returns {[[number, number], [number, number]]} A nested array containing height as [feet, inches] and weight as [stones, pounds].
 */
function getImperialValue() {
  const feet = parseInputValue(inputs.imperial.height.feet);
  const inches = parseInputValue(inputs.imperial.height.inches);

  const stones = parseInputValue(inputs.imperial.weight.stones);
  const pounds = parseInputValue(inputs.imperial.weight.pounds);

  return [
    [feet, inches],
    [stones, pounds],
  ];
}

/**
 * Calculates the BMI, classification, and healthy weight range based on user input.
 * @returns {{bmi: number; classification: string; range: [number, number]}} An object containing the calculated BMI, classification, and range, or nothing if validation fails.
 */
function calculateBMIData() {
  let height, weight;

  if (currentUnit === "metric") {
    const [meters, kilograms] = getMetricValues();
    if (![meters, kilograms].every(isPositiveNumber)) {
      return;
    }

    height = meters;
    weight = kilograms;
  } else {
    const [[feet, inches], [stones, pounds]] = getImperialValue();
    if (![feet, inches, stones, pounds].every(isPositiveNumber)) {
      return;
    }

    height = toMetricHeight(feet, inches);
    weight = toMetricWeight(stones, pounds);
  }

  const bmi = calculateBMI(height, weight);

  const classification =
    bmi < 18.5
      ? "underweight"
      : bmi <= 24.9
        ? "healthy"
        : bmi <= 29.9
          ? "overweight"
          : "obese";

  const range = [18.5 * height * height, 24.9 * height * height];

  return { bmi, classification, range };
}

const resultBMI = document.getElementById("bmi");

const templates = {
  score: `
  <h3 class="heading-xl">
    <span class="body-m">Your BMI is...</span>
    <strong id="bmi-score">{score}</strong>
  </h3>
  <p class="body-s">
    Your BMI suggests you're
    <strong id="bmi-classification">{classification}</strong>.
    Your ideal weight is between
    <strong id="bmi-range">{range}</strong>.
  </p>
  `,
  welcome: `
  <h3 class="heading-m">Welcome!</h3>
  <p class="body-s">
    Enter your height and weight and you’ll see your BMI result here
  </p>
  `,
};

/**
 * Updates the displayed BMI result based on the calculated data.
 * Shows or hides the result element depending on whether a valid calculation was performed.
 */
function updateBMIResult() {
  const data = calculateBMIData();
  if (data) {
    resultBMI.classList.remove("welcome");
    resultBMI.innerHTML = templates.score
      .replace("{score}", data.bmi.toFixed(1))
      .replace("{classification}", data.classification)
      .replace(
        "{range}",
        data.range
          .map(
            currentUnit === "metric"
              ? (value) => `${value.toFixed(1)}kgs`
              : (value) => {
                  const [stones, pounds] = toImperialWeight(value);
                  return `${Math.floor(stones)}st ${Math.floor(pounds)}lbs`;
                },
          )
          .join(" - "),
      );
  } else {
    resultBMI.classList.add("welcome");
    resultBMI.innerHTML = templates.welcome;
  }
}

// Tabs

const tabs = [
  [document.getElementById("tab-metric"), document.getElementById("metric")],
  [
    document.getElementById("tab-imperial"),
    document.getElementById("imperial"),
  ],
];

/**
 * Selects and shows the tab with the specified id and hides all others. Also updates the calculator result.
 * @param {HTMLElement} targetTab - The tab to show.
 */
function showTab(targetTab) {
  const panelId = targetTab.getAttribute("data-panel"); // "metric" or "imperial"
  if (!panelId) {
    return;
  }

  currentUnit = panelId;
  tabs.forEach(([tab, panel]) => {
    if (panel.id === panelId) {
      tab.setAttribute("aria-selected", "true");
      tab.setAttribute("data-selected", "");
      tab.tabIndex = 0;
      tab.focus();
      panel.classList.add("active");
      panel.setAttribute("aria-hidden", "false");
    } else {
      tab.setAttribute("aria-selected", "false");
      tab.removeAttribute("data-selected");
      tab.tabIndex = -1;
      panel.classList.remove("active");
      panel.setAttribute("aria-hidden", "true");
    }
  });
  updateBMIResult();
}

/**
 * Handles changes to the unit selection buttons.
 * Updates the state to trigger a recalculation when a new unit is selected.
 */
tabs.forEach(([tab], i) => {
  tab.addEventListener("click", (event) => {
    showTab(event.target);
  });
  tab.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowLeft": {
        const prevTab = tabs[i - 1];
        if (prevTab) {
          showTab(prevTab[0]);
        }
        break;
      }
      case "ArrowRight": {
        const nextTab = tabs[i + 1];
        if (nextTab) {
          showTab(nextTab[0]);
        }
        break;
      }
      default:
        break;
    }
  });
});

/**
 * Handles changes to all input fields to trigger a result update when their values change.
 */
[
  inputs.metric.height,
  inputs.metric.weight,
  inputs.imperial.height.feet,
  inputs.imperial.height.inches,
  inputs.imperial.weight.stones,
  inputs.imperial.weight.pounds,
].forEach((input) => {
  input.addEventListener("input", updateBMIResult);
});

showTab(tabs[0][0]);
