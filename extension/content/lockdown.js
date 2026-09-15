// ============================================
// ExamGuard Sentinel
// Browser Lockdown Safeguards
// Owner: Anushka Patel
// ============================================

console.log("ExamGuard Lockdown loaded");

// --------------------------------------------
// Configuration
// --------------------------------------------

let examActive = false;

// Prevent duplicate tab-switch events
let lastTabSwitchTime = 0;

const TAB_SWITCH_COOLDOWN = 1000; // 1 second

// --------------------------------------------
// Start ExamGuard Lockdown
// --------------------------------------------

function startLockdown() {
    if (examActive) return;

    examActive = true;

    console.log("ExamGuard lockdown ACTIVE");

    enableClipboardBlocking();
    enableContextMenuBlocking();
    enableKeyboardBlocking();
    enableVisibilityMonitoring();
    enableFullscreenMonitoring();
}

// --------------------------------------------
// Stop ExamGuard Lockdown
// --------------------------------------------

function stopLockdown() {
    examActive = false;

    console.log("ExamGuard lockdown INACTIVE");
}

// --------------------------------------------
// Clipboard Protection
// --------------------------------------------

function enableClipboardBlocking() {

    document.addEventListener("copy", handleClipboard, true);
    document.addEventListener("cut", handleClipboard, true);
    document.addEventListener("paste", handleClipboard, true);
}

function handleClipboard(event) {

    if (!examActive) return;

    event.preventDefault();

    let operation = event.type;

    reportViolation(
        "CLIPBOARD_VIOLATION",
        "LOW", {
            operation: operation
        }
    );

    showWarning(
        "Clipboard operation blocked during the exam."
    );
}

// --------------------------------------------
// Right Click Protection
// --------------------------------------------

function enableContextMenuBlocking() {

    document.addEventListener(
        "contextmenu",
        handleContextMenu,
        true
    );
}

function handleContextMenu(event) {

    if (!examActive) return;

    event.preventDefault();

    reportViolation(
        "CLIPBOARD_VIOLATION",
        "LOW", {
            operation: "contextmenu"
        }
    );

    showWarning(
        "Right-click is disabled during the exam."
    );
}

// --------------------------------------------
// Keyboard Protection
// --------------------------------------------

function enableKeyboardBlocking() {

    document.addEventListener(
        "keydown",
        handleKeyboard,
        true
    );
}

function handleKeyboard(event) {

    if (!examActive) return;

    const key = event.key.toLowerCase();

    // F12
    if (event.key === "F12") {

        event.preventDefault();
        event.stopPropagation();

        reportViolation(
            "DEVTOOLS_ATTEMPT",
            "CRITICAL", {
                shortcut: "F12"
            }
        );

        showWarning(
            "Developer tools are disabled during the exam."
        );

        return;
    }

    // Ctrl + Shift + I
    if (
        event.ctrlKey &&
        event.shiftKey &&
        key === "i"
    ) {

        blockDevToolsShortcut(event, "CTRL_SHIFT_I");
        return;
    }

    // Ctrl + Shift + J
    if (
        event.ctrlKey &&
        event.shiftKey &&
        key === "j"
    ) {

        blockDevToolsShortcut(event, "CTRL_SHIFT_J");
        return;
    }

    // Ctrl + Shift + C
    if (
        event.ctrlKey &&
        event.shiftKey &&
        key === "c"
    ) {

        blockDevToolsShortcut(event, "CTRL_SHIFT_C");
        return;
    }

    // Ctrl + C
    if (event.ctrlKey && key === "c") {

        event.preventDefault();

        reportViolation(
            "CLIPBOARD_VIOLATION",
            "LOW", {
                operation: "copy"
            }
        );

        showWarning(
            "Copy is disabled during the exam."
        );

        return;
    }

    // Ctrl + X
    if (event.ctrlKey && key === "x") {

        event.preventDefault();

        reportViolation(
            "CLIPBOARD_VIOLATION",
            "LOW", {
                operation: "cut"
            }
        );

        showWarning(
            "Cut is disabled during the exam."
        );

        return;
    }

    // Ctrl + V
    if (event.ctrlKey && key === "v") {

        event.preventDefault();

        reportViolation(
            "CLIPBOARD_VIOLATION",
            "LOW", {
                operation: "paste"
            }
        );

        showWarning(
            "Paste is disabled during the exam."
        );

        return;
    }
}

function blockDevToolsShortcut(event, shortcut) {

    event.preventDefault();
    event.stopPropagation();

    reportViolation(
        "DEVTOOLS_ATTEMPT",
        "CRITICAL", {
            shortcut: shortcut
        }
    );

    showWarning(
        "Developer tools are disabled during the exam."
    );
}

// --------------------------------------------
// Tab Switch / Visibility Detection
// --------------------------------------------

function enableVisibilityMonitoring() {

    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange,
        true
    );

    window.addEventListener(
        "blur",
        handleWindowBlur,
        true
    );

    window.addEventListener(
        "focus",
        handleWindowFocus,
        true
    );
}

function handleVisibilityChange() {

    if (!examActive) return;

    if (document.visibilityState === "hidden") {

        const now = Date.now();

        // Ignore duplicate event
        if (
            now - lastTabSwitchTime <
            TAB_SWITCH_COOLDOWN
        ) {
            return;
        }

        lastTabSwitchTime = now;

        reportViolation(
            "TAB_SWITCH_BLUR",
            "HIGH", {
                reason: "document_hidden"
            }
        );

        showWarning(
            "Exam window lost focus. This incident has been recorded."
        );
    }
}

function handleWindowBlur() {

    if (!examActive) return;

    const now = Date.now();

    // Ignore duplicate event
    if (
        now - lastTabSwitchTime <
        TAB_SWITCH_COOLDOWN
    ) {
        return;
    }

    lastTabSwitchTime = now;

    reportViolation(
        "TAB_SWITCH_BLUR",
        "HIGH", {
            reason: "window_blur"
        }
    );
}

function handleWindowFocus() {

    if (!examActive) return;

    console.log("Exam window focused again");
}

// --------------------------------------------
// Fullscreen Monitoring
// --------------------------------------------

function enableFullscreenMonitoring() {

    document.addEventListener(
        "fullscreenchange",
        handleFullscreenChange,
        true
    );
}

function handleFullscreenChange() {

    if (!examActive) return;

    if (!document.fullscreenElement) {

        reportViolation(
            "FULLSCREEN_EXIT",
            "HIGH", {}
        );

        showWarning(
            "Fullscreen mode was exited. Please return to fullscreen."
        );
    }
}


// --------------------------------------------
// Telemetry Session Information
// --------------------------------------------

let examId = "";
let sessionId = "";
let studentId = "";

// --------------------------------------------
// Violation Reporter
// --------------------------------------------
function reportViolation(
    subtype,
    severity,
    metrics = {}
) {

    const event = {

        type: "TELEMETRY_ANOMALY",

        event_id: crypto.randomUUID(),

        exam_id: examId,

        session_id: sessionId,

        student_id: studentId,

        timestamp: new Date().toISOString(),

        category: "ENVIRONMENT",

        subtype: subtype,

        severity: severity,

        confidence: 1.0,

        metrics: metrics,

        message: `Environment anomaly detected: ${subtype}`
    };

    console.log(
        "ExamGuard Violation:",
        event
    );

    // Send event to background service worker
    chrome.runtime.sendMessage({
        action: "TELEMETRY_EVENT",
        data: event
    });
}

// --------------------------------------------
// Warning UI
// --------------------------------------------

function showWarning(message) {

    let existing = document.getElementById(
        "examguard-warning"
    );

    if (existing) {
        existing.remove();
    }

    const warning = document.createElement("div");

    warning.id = "examguard-warning";

    warning.textContent = message;

    warning.style.position = "fixed";
    warning.style.top = "20px";
    warning.style.left = "50%";
    warning.style.transform = "translateX(-50%)";

    warning.style.zIndex = "2147483647";

    warning.style.padding = "15px 25px";

    warning.style.background = "#b91c1c";

    warning.style.color = "white";

    warning.style.fontFamily = "Arial, sans-serif";

    warning.style.fontSize = "16px";

    warning.style.fontWeight = "bold";

    warning.style.borderRadius = "8px";

    warning.style.boxShadow =
        "0 4px 15px rgba(0,0,0,0.3)";

    document.documentElement.appendChild(
        warning
    );

    setTimeout(() => {

        warning.remove();

    }, 4000);
}

// --------------------------------------------
// Temporary development control
// --------------------------------------------

// For development/testing only.
// We will replace this with the actual exam
// session state from the extension popup/backend.

chrome.runtime.onMessage.addListener(
    (message) => {

        if (message.action === "START_EXAM") {
            startLockdown();
        }

        if (message.action === "STOP_EXAM") {
            stopLockdown();
        }
    }
);