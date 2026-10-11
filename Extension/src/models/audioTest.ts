import { AudioAnalyzer } from "./audioAnalyzer.js";
import { AnomalyScorer } from "./anomalyScorer.js";
import { createAudioTelemetry } from "./audioTelemetry.js";

const analyzer = new AudioAnalyzer();
const scorer = new AnomalyScorer();

const startButton = document.getElementById(
  "startAudio"
) as HTMLButtonElement;

const stopButton = document.getElementById(
  "stopAudio"
) as HTMLButtonElement;

const statusText = document.getElementById(
  "statusText"
) as HTMLDivElement;

const scoreElement = document.getElementById(
  "score"
) as HTMLDivElement;

const levelElement = document.getElementById(
  "level"
) as HTMLDivElement;

const eventTypeElement = document.getElementById(
  "eventType"
) as HTMLSpanElement;

const volumeElement = document.getElementById(
  "volume"
) as HTMLSpanElement;

const speechEnergyElement = document.getElementById(
  "speechEnergy"
) as HTMLSpanElement;

const frequencyElement = document.getElementById(
  "frequency"
) as HTMLSpanElement;

const reasonsElement = document.getElementById(
  "reasons"
) as HTMLDivElement;

const historyList = document.getElementById(
  "historyList"
) as HTMLDivElement;

let eventCount = 0;

startButton.addEventListener("click", async () => {
  scorer.reset();
  eventCount = 0;

  statusText.textContent = "STARTING...";

  try {
    await analyzer.start((event) => {

      // Calculate anomaly result
      const result = scorer.calculate(event);

      // Create clean telemetry object
      const telemetry = createAudioTelemetry(
        event,
        result
      );

      // Send telemetry to browser console
      console.log(
        "ExamGuard Audio Telemetry:",
        telemetry
      );

      // Update anomaly score
      scoreElement.textContent =
        `${telemetry.anomalyScore}`;

      // Update anomaly level
      levelElement.textContent =
        telemetry.anomalyLevel;

      // Update event type
      eventTypeElement.textContent =
        telemetry.eventType;

      // Update volume
      volumeElement.textContent =
        telemetry.metrics.volume.toFixed(2);

      // Update speech energy
      speechEnergyElement.textContent =
        telemetry.metrics.speechEnergy.toFixed(2);

      // Update dominant frequency
      frequencyElement.textContent =
        `${telemetry.metrics.dominantFrequency.toFixed(2)} Hz`;

      // Update reasons
      if (telemetry.reasons.length > 0) {

        reasonsElement.innerHTML =
          telemetry.reasons
            .map(
              (reason) =>
                `<div class="reason">${reason}</div>`
            )
            .join("");

      } else {

        reasonsElement.innerHTML =
          `<div class="reason">
             No suspicious activity
           </div>`;
      }

      // Add event to history
      addHistoryItem(
        telemetry.eventType,
        telemetry.anomalyScore,
        telemetry.anomalyLevel
      );
    });

    statusText.textContent = "ACTIVE";

  } catch (error) {

    statusText.textContent = "ERROR";

    console.error(
      "Audio monitoring error:",
      error
    );
  }
});

stopButton.addEventListener("click", () => {

  analyzer.stop();
  scorer.reset();

  statusText.textContent = "INACTIVE";

  scoreElement.textContent = "0";
  levelElement.textContent = "LOW";

  eventTypeElement.textContent = "---";
  volumeElement.textContent = "0";
  speechEnergyElement.textContent = "0";
  frequencyElement.textContent = "0 Hz";

  reasonsElement.innerHTML =
    `<div class="reason">
       No suspicious activity
     </div>`;
});

function addHistoryItem(
  eventType: string,
  score: number,
  level: string
): void {

  eventCount++;

  if (eventCount === 1) {
    historyList.innerHTML = "";
  }

  const item = document.createElement("div");

  item.className = "history-item";

  item.innerHTML =
    `<span class="history-score">
       ${score}/100
     </span>
     — ${level} — ${eventType}`;

  historyList.prepend(item);

  // Keep only the latest 10 events
  if (historyList.children.length > 10) {

    const lastItem =
      historyList.lastElementChild;

    if (lastItem !== null) {
      historyList.removeChild(lastItem);
    }
  }
}