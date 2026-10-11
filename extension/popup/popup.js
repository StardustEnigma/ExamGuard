// ============================================================
// ExamGuard Sentinel
// Popup Controller
// Owner: Anushka Patel
// ============================================================

const API_BASE_URL =
    "http://localhost:8080/api/v1";


// ------------------------------------------------------------
// DOM Elements
// ------------------------------------------------------------

const examKeyInput =
    document.getElementById("examKey");

const studentIdInput =
    document.getElementById("studentId");

const secretPinInput =
    document.getElementById("secretPin");

const loginButton =
    document.getElementById("loginButton");

const loginStatus =
    document.getElementById("loginStatus");

const statusElement =
    document.getElementById("status");

const startButton =
    document.getElementById("startExam");

const stopButton =
    document.getElementById("stopExam");


// ------------------------------------------------------------
// Update Exam Status
// ------------------------------------------------------------

function updateStatus(isActive) {

    if (isActive) {

        statusElement.textContent =
            "Exam Active";

        statusElement.className =
            "status active";

    } else {

        statusElement.textContent =
            "Exam Not Started";

        statusElement.className =
            "status inactive";
    }
}


// ------------------------------------------------------------
// Update Login Status
// ------------------------------------------------------------

function updateLoginStatus(
    message,
    success = false
) {

    loginStatus.textContent =
        message;

    loginStatus.style.color =
        success ? "green" : "red";
}


// ------------------------------------------------------------
// Load Existing State
// ------------------------------------------------------------

chrome.storage.local.get(
    [
        "examActive",
        "authToken",
        "studentId",
        "examId",
        "studentName"
    ],
    (result) => {

        // Update exam status

        updateStatus(
            result.examActive === true
        );


        // Update login status

        if (result.authToken) {

            updateLoginStatus(
                `Logged in: ${result.studentName || "Student " + result.studentId}`,
                true
            );

            startButton.disabled = false;

        } else {

            updateLoginStatus(
                "Not logged in",
                false
            );

            startButton.disabled = true;
        }
    }
);


// ------------------------------------------------------------
// Student Login
// ------------------------------------------------------------

loginButton.addEventListener(
    "click",
    async() => {

        console.log(
            "[ExamGuard Popup] Login button clicked"
        );


        // Get input values

        const examKey =
            examKeyInput.value.trim();

        const studentId =
            studentIdInput.value.trim();

        const secretPin =
            secretPinInput.value.trim();


        // Validate input

        if (!examKey ||
            !studentId ||
            !secretPin
        ) {

            updateLoginStatus(
                "Please fill all fields."
            );

            return;
        }


        // Disable login button

        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";


        try {

            console.log(
                "[ExamGuard Popup] Sending login request"
            );


            // ------------------------------------------------
            // Login request
            // ------------------------------------------------

            const response =
                await fetch(
                    `${API_BASE_URL}/auth/student/login`, {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            exam_key: examKey,
                            student_id: studentId,
                            secret_pin: secretPin
                        })
                    }
                );


            // ------------------------------------------------
            // Read response
            // ------------------------------------------------

            const data =
                await response.json();


            console.log(
                "[ExamGuard Popup] Login response:", {
                    success: data.success,
                    student: data.student
                }
            );


            // ------------------------------------------------
            // Check login result
            // ------------------------------------------------

            if (!response.ok ||
                !data.success
            ) {

                let errorMessage =
                    "Login failed";


                if (
                    data.error &&
                    data.error.message
                ) {

                    errorMessage =
                        data.error.message;
                }


                throw new Error(
                    errorMessage
                );
            }


            // ------------------------------------------------
            // Validate returned token
            // ------------------------------------------------

            if (!data.token) {

                throw new Error(
                    "Login succeeded but no authentication token was returned."
                );
            }


            // ------------------------------------------------
            // Save authentication information
            // ------------------------------------------------

            await chrome.storage.local.set({

                authToken: data.token,

                studentId: data.student.student_id,

                examId: data.student.exam_id,

                studentName: data.student.name

            });


            // ------------------------------------------------
            // Update UI
            // ------------------------------------------------

            updateLoginStatus(
                `Logged in: ${data.student.name}`,
                true
            );


            // Enable Start Exam

            startButton.disabled = false;


            console.log(
                "[ExamGuard Popup] Login successful"
            );

        } catch (error) {

            console.error(
                "[ExamGuard Popup] Login failed:",
                error
            );


            updateLoginStatus(
                error.message ||
                "Login failed"
            );


            startButton.disabled = true;

        } finally {

            // Restore login button

            loginButton.disabled = false;

            loginButton.textContent =
                "Login";
        }
    }
);


// ------------------------------------------------------------
// Start Exam
// ------------------------------------------------------------

startButton.addEventListener(
    "click",
    async() => {

        console.log(
            "[ExamGuard Popup] Start Exam clicked"
        );


        // Get authentication information

        const auth =
            await chrome.storage.local.get(
                [
                    "authToken",
                    "examId",
                    "studentId"
                ]
            );


        // Make sure student is logged in

        if (!auth.authToken) {

            updateLoginStatus(
                "Please login before starting."
            );

            return;
        }


        try {

            // ------------------------------------------------
            // Tell background service worker
            // ------------------------------------------------

            const response =
                await chrome.runtime.sendMessage({
                    action: "START_EXAM"
                });


            console.log(
                "[ExamGuard Popup] START_EXAM sent to background",
                response
            );


            // ------------------------------------------------
            // Activate lockdown on active tab
            // ------------------------------------------------

            const tabs =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });


            const tab =
                tabs[0];


            if (
                tab &&
                tab.id
            ) {

                try {

                    await chrome.tabs.sendMessage(
                        tab.id, {
                            action: "START_EXAM"
                        }
                    );


                    console.log(
                        "[ExamGuard Popup] Lockdown activated"
                    );

                } catch (error) {

                    console.warn(
                        "[ExamGuard Popup] Content script unavailable:",
                        error
                    );
                }
            }


            // ------------------------------------------------
            // Save exam state
            // ------------------------------------------------

            await chrome.storage.local.set({
                examActive: true
            });


            // Update UI

            updateStatus(true);


            console.log(
                "[ExamGuard Popup] Exam started successfully"
            );

        } catch (error) {

            console.error(
                "[ExamGuard Popup] Failed to start exam:",
                error
            );


            updateStatus(false);
        }
    }
);


// ------------------------------------------------------------
// Stop Exam
// ------------------------------------------------------------

stopButton.addEventListener(
    "click",
    async() => {

        console.log(
            "[ExamGuard Popup] Stop Exam clicked"
        );


        try {

            // ------------------------------------------------
            // Tell background service worker
            // ------------------------------------------------

            await chrome.runtime.sendMessage({
                action: "STOP_EXAM"
            });


            console.log(
                "[ExamGuard Popup] STOP_EXAM sent to background"
            );


            // ------------------------------------------------
            // Stop lockdown on active tab
            // ------------------------------------------------

            const tabs =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });


            const tab =
                tabs[0];


            if (
                tab &&
                tab.id
            ) {

                try {

                    await chrome.tabs.sendMessage(
                        tab.id, {
                            action: "STOP_EXAM"
                        }
                    );


                    console.log(
                        "[ExamGuard Popup] Lockdown stopped"
                    );

                } catch (error) {

                    console.warn(
                        "[ExamGuard Popup] Content script unavailable:",
                        error
                    );
                }
            }


            // ------------------------------------------------
            // Save exam state
            // ------------------------------------------------

            await chrome.storage.local.set({
                examActive: false
            });


            // Update UI

            updateStatus(false);


            console.log(
                "[ExamGuard Popup] Exam stopped successfully"
            );

        } catch (error) {

            console.error(
                "[ExamGuard Popup] Failed to stop exam:",
                error
            );
        }
    }
);