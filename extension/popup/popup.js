const statusElement = document.getElementById("status");
const startButton = document.getElementById("startExam");
const stopButton = document.getElementById("stopExam");

// --------------------------------------------
// Update popup status
// --------------------------------------------

function updateStatus(isActive) {

    if (isActive) {

        statusElement.textContent = "Exam Active";
        statusElement.className = "status active";

    } else {

        statusElement.textContent = "Exam Not Started";
        statusElement.className = "status inactive";
    }
}

// --------------------------------------------
// Load saved exam state
// --------------------------------------------

chrome.storage.local.get(
    ["examActive"],
    (result) => {

        updateStatus(
            result.examActive === true
        );
    }
);

// --------------------------------------------
// Start Exam
// --------------------------------------------

startButton.addEventListener(
    "click",
    async() => {

        console.log(
            "[ExamGuard Popup] Start Exam clicked"
        );

        const tabs =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

        const tab = tabs[0];

        if (!tab || !tab.id) {

            console.error(
                "[ExamGuard Popup] Active tab not found"
            );

            return;
        }

        try {

            await chrome.tabs.sendMessage(
                tab.id, {
                    action: "START_EXAM"
                }
            );

            // Save exam state
            await chrome.storage.local.set({
                examActive: true
            });

            console.log(
                "[ExamGuard Popup] START_EXAM sent successfully"
            );

            updateStatus(true);

        } catch (error) {

            console.error(
                "[ExamGuard Popup] Failed to send START_EXAM:",
                error
            );

            updateStatus(false);
        }
    }
);

// --------------------------------------------
// Stop Exam
// --------------------------------------------

stopButton.addEventListener(
    "click",
    async() => {

        console.log(
            "[ExamGuard Popup] Stop Exam clicked"
        );

        const tabs =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

        const tab = tabs[0];

        if (!tab || !tab.id) return;

        try {

            await chrome.tabs.sendMessage(
                tab.id, {
                    action: "STOP_EXAM"
                }
            );

            // Save exam state
            await chrome.storage.local.set({
                examActive: false
            });

            console.log(
                "[ExamGuard Popup] STOP_EXAM sent successfully"
            );

            updateStatus(false);

        } catch (error) {

            console.error(
                "[ExamGuard Popup] Failed to send STOP_EXAM:",
                error
            );
        }
    }
);