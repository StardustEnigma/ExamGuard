// ============================================
// ExamGuard Sentinel
// Background Service Worker
// Owner: Anushka Patel
// ============================================

console.log("ExamGuard background service worker running");

// --------------------------------------------
// Receive messages from content scripts
// --------------------------------------------

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.action === "TELEMETRY_EVENT") {

            console.log(
                "Telemetry received from lockdown:",
                message.data
            );

            // WebSocket integration will be added here.
            // For now, we verify that the event reaches
            // the background service worker.

        }

        return true;
    }
);