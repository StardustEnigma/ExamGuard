// ============================================================
// ExamGuard Sentinel
// Background Service Worker
// Owner: Anushka Patel
// ============================================================

console.log(
    "[ExamGuard] Background service worker running"
);

// ------------------------------------------------------------
// Backend Configuration
// ------------------------------------------------------------

const WS_BASE_URL =
    "ws://localhost:8080/ws/telemetry";

const DEFAULT_EXAM_ID =
    "exam_2026_cs501";

const DEFAULT_STUDENT_ID =
    "50";

// ------------------------------------------------------------
// WebSocket State
// ------------------------------------------------------------

let socket = null;

let sessionId = null;

let reconnectTimer = null;

let heartbeatTimer = null;

// ------------------------------------------------------------
// Connect to Backend
// ------------------------------------------------------------

async function connectWebSocket() {

    if (
        socket &&
        socket.readyState === WebSocket.OPEN
    ) {
        console.log(
            "[ExamGuard] WebSocket already connected"
        );
        return;
    }


    // Get the real JWT from Chrome storage

    const auth =
        await chrome.storage.local.get([
            "authToken",
            "examId",
            "studentId"
        ]);


    if (!auth.authToken) {

        console.error(
            "[ExamGuard] No authentication token found."
        );

        return;
    }


    const examId =
        auth.examId ||
        DEFAULT_EXAM_ID;


    const url =
        `${WS_BASE_URL}?token=${encodeURIComponent(auth.authToken)}&exam_id=${encodeURIComponent(examId)}`;


    console.log(
        "[ExamGuard] Connecting to authenticated WebSocket..."
    );


    socket =
        new WebSocket(url);


    socket.addEventListener(
        "open",
        () => {

            console.log(
                "[ExamGuard] WebSocket connected"
            );

            sendSessionInit();
        }
    );


    socket.addEventListener(
        "message",
        (event) => {

            console.log(
                "[ExamGuard] Backend message:",
                event.data
            );

            handleBackendMessage(
                event.data
            );
        }
    );


    socket.addEventListener(
        "error",
        (error) => {

            console.error(
                "[ExamGuard] WebSocket error:",
                error
            );
        }
    );


    socket.addEventListener(
        "close",
        (event) => {

            console.warn(
                "[ExamGuard] WebSocket closed:",
                event.code,
                event.reason
            );

            stopHeartbeat();

            socket = null;
            sessionId = null;

            chrome.storage.local.get(
                ["examActive"],
                (result) => {

                    if (
                        result.examActive === true
                    ) {
                        scheduleReconnect();
                    }
                }
            );
        }
    );
}

// ------------------------------------------------------------
// SESSION_INIT
// ------------------------------------------------------------

async function sendSessionInit() {

    if (!socket ||
        socket.readyState !== WebSocket.OPEN
    ) {

        console.warn(
            "[ExamGuard] Cannot send SESSION_INIT"
        );

        return;
    }


    const auth =
        await chrome.storage.local.get([
            "examId",
            "studentId"
        ]);


    const message = {

        type: "SESSION_INIT",

        event_id: crypto.randomUUID(),

        exam_id: auth.examId ||
            DEFAULT_EXAM_ID,

        student_id: auth.studentId ||
            DEFAULT_STUDENT_ID,

        timestamp: new Date().toISOString(),

        payload: {
            client_version: "ExamGuard-Sentinel-1.0.0",
            browser: "Chrome",
            screen: {
                width: 0,
                height: 0
            },
            capabilities: {
                clipboard_blocking: true,
                context_menu_blocking: true,
                keyboard_monitoring: true,
                visibility_monitoring: true,
                fullscreen_monitoring: true
            }
        }
    };

    console.log(
        "[ExamGuard] Sending SESSION_INIT:",
        message
    );


    socket.send(
        JSON.stringify(message)
    );
}

// ------------------------------------------------------------
// Backend Message Handler
// ------------------------------------------------------------

function handleBackendMessage(
    rawMessage
) {

    let message;

    try {

        message =
            JSON.parse(rawMessage);

    } catch (error) {

        console.error(
            "[ExamGuard] Invalid backend JSON:",
            error
        );

        return;
    }

    switch (message.type) {

        case "SESSION_INIT_ACK":

            handleSessionInitAck(
                message
            );

            break;

        case "HEARTBEAT_PONG":

            console.log(
                "[ExamGuard] HEARTBEAT_PONG received"
            );

            break;

        case "COMMAND":

            handleCommand(
                message
            );

            break;

        default:

            console.log(
                "[ExamGuard] Unhandled backend message:",
                message.type
            );
    }
}

// ------------------------------------------------------------
// SESSION_INIT_ACK
// ------------------------------------------------------------

function handleSessionInitAck(
    message
) {

    console.log(
        "[ExamGuard] SESSION_INIT_ACK received:",
        message
    );

    sessionId =
        message.session_id;

    console.log(
        "[ExamGuard] Session ID:",
        sessionId
    );

    chrome.storage.local.set({

        sessionId: sessionId,

        examId: DEFAULT_EXAM_ID,

        studentId: DEFAULT_STUDENT_ID

    });

    startHeartbeat();
}

// ------------------------------------------------------------
// Heartbeat
// ------------------------------------------------------------

function startHeartbeat() {

    stopHeartbeat();

    heartbeatTimer =
        setInterval(
            () => {

                if (!socket ||
                    socket.readyState !==
                    WebSocket.OPEN
                ) {
                    return;
                }

                const heartbeat = {

                    type: "HEARTBEAT_PING",

                    timestamp: new Date().toISOString()
                };

                socket.send(
                    JSON.stringify(
                        heartbeat
                    )
                );

                console.log(
                    "[ExamGuard] HEARTBEAT_PING sent"
                );

            },
            5000
        );
}

function stopHeartbeat() {

    if (heartbeatTimer) {

        clearInterval(
            heartbeatTimer
        );

        heartbeatTimer = null;
    }
}

// ------------------------------------------------------------
// Backend Commands
// ------------------------------------------------------------

function handleCommand(
    message
) {

    console.log(
        "[ExamGuard] Command received:",
        message
    );

    switch (message.action) {

        case "PROCTOR_WARNING":

            showProctorWarning(
                message.message ||
                "Please follow the exam rules."
            );

            break;

        case "LOCK_EXAM":

            sendCommandToActiveTab(
                "LOCK_EXAM"
            );

            break;

        case "TERMINATE_EXAM":

            sendCommandToActiveTab(
                "TERMINATE_EXAM"
            );

            break;

        default:

            console.warn(
                "[ExamGuard] Unknown command:",
                message.action
            );
    }
}

// ------------------------------------------------------------
// Send command to current exam tab
// ------------------------------------------------------------

async function sendCommandToActiveTab(
    action
) {

    const tabs =
        await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

    const tab = tabs[0];

    if (!tab || !tab.id) {

        console.warn(
            "[ExamGuard] Active exam tab not found"
        );

        return;
    }

    try {

        await chrome.tabs.sendMessage(
            tab.id, {
                action: action
            }
        );

    } catch (error) {

        console.error(
            "[ExamGuard] Failed to send command to tab:",
            error
        );
    }
}

// ------------------------------------------------------------
// Warning from backend
// ------------------------------------------------------------

function showProctorWarning(
    message
) {

    sendCommandToActiveTab(
        "PROCTOR_WARNING"
    );

    console.warn(
        "[ExamGuard] PROCTOR WARNING:",
        message
    );
}

// ------------------------------------------------------------
// Forward telemetry to backend
// ------------------------------------------------------------

function sendTelemetry(
    telemetry
) {

    if (!socket ||
        socket.readyState !==
        WebSocket.OPEN
    ) {

        console.warn(
            "[ExamGuard] WebSocket not connected. Telemetry not sent."
        );

        return;
    }

    // Attach current session information
    telemetry.exam_id =
        DEFAULT_EXAM_ID;

    telemetry.student_id =
        DEFAULT_STUDENT_ID;

    telemetry.session_id =
        sessionId || "";

    socket.send(
        JSON.stringify(
            telemetry
        )
    );

    console.log(
        "[ExamGuard] Telemetry sent:",
        telemetry
    );
}

// ------------------------------------------------------------
// Reconnect
// ------------------------------------------------------------

function scheduleReconnect() {

    if (reconnectTimer) {
        return;
    }

    reconnectTimer =
        setTimeout(
            () => {

                reconnectTimer = null;

                connectWebSocket();

            },
            3000
        );
}

// ------------------------------------------------------------
// Messages from content script / popup
// ------------------------------------------------------------

chrome.runtime.onMessage.addListener(
    (message) => {

        if (
            message.action ===
            "TELEMETRY_EVENT"
        ) {

            console.log(
                "[ExamGuard] Telemetry received:",
                message.data
            );

            sendTelemetry(
                message.data
            );
        }

        if (
            message.action ===
            "START_EXAM"
        ) {

            console.log(
                "[ExamGuard] Start exam requested"
            );

            connectWebSocket();
        }

        if (
            message.action ===
            "STOP_EXAM"
        ) {

            console.log(
                "[ExamGuard] Stop exam requested"
            );

            stopHeartbeat();

            if (
                socket &&
                socket.readyState ===
                WebSocket.OPEN
            ) {

                socket.close(
                    1000,
                    "Exam stopped"
                );
            }

            socket = null;
            sessionId = null;
        }
    }
);