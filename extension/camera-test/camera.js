const video = document.getElementById("video");
const status = document.getElementById("status");

const headPoseStatus = document.createElement("p");
document.body.appendChild(headPoseStatus);

let headPoseAnomalyStartTime = null;

const HEAD_POSE_DURATION = 3000; // 3 seconds

let headPoseAnomalyReported = false;

let gazeDeviationStartTime = null;

const GAZE_DEVIATION_DURATION = 3500; // 3.5 seconds

let gazeDeviationReported = false;

let faceNotDetectedStartTime = null;
let faceNotDetectedReported = false;

let multipleFacesReported = false;

const FACE_NOT_DETECTED_DURATION = 5000; // 5 seconds

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = stream;

        await video.play();

        console.log("Camera started successfully");

        status.textContent = "Camera working. Initializing face detector...";

        try {
            console.log("Starting MediaPipe initialization...");

            await ExamGuardVision.initializeFaceDetector();

            console.log("Face Detector initialization successful");

            status.textContent = "Initializing Head Pose...";

            await ExamGuardHeadPose.initializeHeadPoseEstimator();

            console.log("Face Landmarker initialization successful");

            status.textContent = "Face Detector + Head Pose ready";

            detectFaces();

        } catch (error) {
            console.error("MEDIAPIPE INITIALIZATION ERROR:", error);
            console.error("ERROR NAME:", error?.name);
            console.error("ERROR MESSAGE:", error?.message);
            console.error("ERROR STACK:", error?.stack);
            console.error("ERROR OBJECT:", error);

            status.textContent = "MediaPipe initialization failed - check Console";
        }

    } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("ERROR TYPE:", typeof error);
    console.error("ERROR JSON:", JSON.stringify(error));
    console.error("ERROR STACK:", error?.stack);

    status.textContent = "Check browser console for full error";
}
}


function detectFaces() {
    const result = ExamGuardVision.detectFaces(video);
    const faceCount = result.faceCount;
    const now = performance.now();

    // 1. FACE NOT DETECTED
    if (faceCount === 0) {
        status.textContent = "FACE_NOT_DETECTED";

        if (faceNotDetectedStartTime === null) {
            faceNotDetectedStartTime = now;
        }

        const duration = now - faceNotDetectedStartTime;

        if (
            duration >= FACE_NOT_DETECTED_DURATION &&
            !faceNotDetectedReported
        ) {
            const event = {
                type: "VISION_ANOMALY",
                subtype: "FACE_NOT_DETECTED",
                durationSeconds: duration / 1000,
                metrics: {
                    faceCount: 0
                }
            };

            console.log("FACE EVENT:", event);
            faceNotDetectedReported = true;
        }
    } else {
        faceNotDetectedStartTime = null;
        faceNotDetectedReported = false;
    }

    // 2. MULTIPLE FACES DETECTED
    if (faceCount > 1) {
        status.textContent = "MULTIPLE_FACES_DETECTED";

        if (!multipleFacesReported) {
            const event = {
                type: "VISION_ANOMALY",
                subtype: "MULTIPLE_FACES_DETECTED",
                metrics: {
                    faceCount: faceCount
                }
            };

            console.log("FACE EVENT:", event);
            multipleFacesReported = true;
        }
    } else {
        multipleFacesReported = false;

        if (faceCount === 1) {
            status.textContent = "NORMAL";
        }
    }

    // Only analyze gaze and head pose when exactly one face is visible.
    if (faceCount === 1) {
        const headPoseResult =
            ExamGuardHeadPose.estimateHeadPose(video);

        // 3. GAZE DEVIATION
        if (headPoseResult?.landmarks) {
            const gaze = ExamGuardHeadPose.estimateGaze(
                headPoseResult.landmarks
            );

            if (gaze && gaze.direction === "CENTER") {
                gazeDeviationStartTime = null;
                gazeDeviationReported = false;
            } else if (gaze) {
                if (gazeDeviationStartTime === null) {
                    gazeDeviationStartTime = now;
                }

                const duration =
                    now - gazeDeviationStartTime;

                if (
                    duration >= GAZE_DEVIATION_DURATION &&
                    !gazeDeviationReported
                ) {
                    const event = {
                        type: "VISION_ANOMALY",
                        subtype: "GAZE_DEVIATION",
                        durationSeconds: duration / 1000,
                        metrics: {
                            direction: gaze.direction,
                            gazeX: gaze.gazeX
                        }
                    };

                    console.log("GAZE EVENT:", event);
                    gazeDeviationReported = true;
                }
            }
        } else {
            gazeDeviationStartTime = null;
            gazeDeviationReported = false;
        }

        // 4. HEAD POSE ANOMALY
        if (headPoseResult) {
            const anomaly =
                ExamGuardHeadPose.isHeadPoseAnomaly(
                    headPoseResult
                );

            if (anomaly) {
                if (headPoseAnomalyStartTime === null) {
                    headPoseAnomalyStartTime = now;
                }

                const duration =
                    now - headPoseAnomalyStartTime;

                if (duration >= HEAD_POSE_DURATION) {
                    headPoseStatus.textContent =
                        "HEAD_POSE_ANOMALY";

                    if (!headPoseAnomalyReported) {
                        const event = {
                            type: "VISION_ANOMALY",
                            subtype: "HEAD_POSE_ANOMALY",
                            durationSeconds: duration / 1000,
                            metrics: {
                                pitch: headPoseResult.pitch,
                                yaw: headPoseResult.yaw,
                                roll: headPoseResult.roll
                            }
                        };

                        console.log("HEAD POSE EVENT:", event);
                        headPoseAnomalyReported = true;
                    }
                } else {
                    headPoseStatus.textContent =
                        "HEAD_POSE_WARNING";
                }
            } else {
                headPoseAnomalyStartTime = null;
                headPoseAnomalyReported = false;
                headPoseStatus.textContent =
                    "HEAD_POSE_NORMAL";
            }
        } else {
            headPoseAnomalyStartTime = null;
            headPoseAnomalyReported = false;
            headPoseStatus.textContent =
                "HEAD_POSE_UNKNOWN";
        }
    } else {
        // Reset pose and gaze timers when there isn't exactly one face.
        gazeDeviationStartTime = null;
        gazeDeviationReported = false;

        headPoseAnomalyStartTime = null;
        headPoseAnomalyReported = false;
        headPoseStatus.textContent = "HEAD_POSE_UNKNOWN";
    }

    requestAnimationFrame(detectFaces);
}


startCamera();