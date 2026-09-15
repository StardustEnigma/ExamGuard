const statusElement =
    document.getElementById("status");

const startButton =
    document.getElementById("startExam");

const stopButton =
    document.getElementById("stopExam");


// ============================================
// START EXAM
// ============================================

startButton.addEventListener(
    "click",
    async() => {

        console.log("[ExamGuard Popup] Start Exam clicked");

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

            console.log(
                "[ExamGuard Popup] START_EXAM sent successfully"
            );

            statusElement.textContent =
                "Exam Active";

            statusElement.className =
                "status active";

        } catch (error) {

            console.error(
                "[ExamGuard Popup] Failed to send START_EXAM:",
                error
            );

            statusElement.textContent =
                "Unable to start exam";

            statusElement.className =
                "status inactive";
        }
    }
);


// ============================================
// STOP EXAM
// ============================================

stopButton.addEventListener(
    "click",
    async() => {

        console.log("[ExamGuard Popup] Stop Exam clicked");

        const tabs =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

        const tab = tabs[0];

        if (!tab || !tab.id) {
            return;
        }

        try {

            await chrome.tabs.sendMessage(
                tab.id, {
                    action: "STOP_EXAM"
                }
            );

            console.log(
                "[ExamGuard Popup] STOP_EXAM sent successfully"
            );

            statusElement.textContent =
                "Exam Not Started";

            statusElement.className =
                "status inactive";

        } catch (error) {

            console.error(
                "[ExamGuard Popup] Failed to send STOP_EXAM:",
                error
            );
        }
    }
);