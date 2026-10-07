const video = document.getElementById("video");
const status = document.getElementById("status");

const headPoseStatus = document.createElement("p");
document.body.appendChild(headPoseStatus);

let headPoseAnomalyStartTime = null;

const HEAD_POSE_DURATION = 3000; // 3 seconds

let gazeDeviationStartTime = null;

const GAZE_DEVIATION_DURATION = 3500; // 3.5 seconds

let gazeDeviationReported = false;

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

    const headPoseResult = ExamGuardHeadPose.estimateHeadPose(video);

    console.log("Head pose result:", headPoseResult);

    if (headPoseResult?.landmarks) {
        console.log("Face landmarks:", headPoseResult.landmarks);
    }

    if (headPoseResult?.landmarks) {
        const landmarks = headPoseResult.landmarks;

        console.log("Left iris:", {
            468: landmarks[468],
            469: landmarks[469],
            470: landmarks[470],
            471: landmarks[471],
            472: landmarks[472]
        });

        console.log("Right iris:", {
            473: landmarks[473],
            474: landmarks[474],
            475: landmarks[475],
            476: landmarks[476],
            477: landmarks[477]
        });

        const gaze = ExamGuardHeadPose.estimateGaze(landmarks);

        console.log("Gaze result:", gaze);

        if (gaze.direction === "CENTER") {
            gazeDeviationStartTime = null;
            gazeDeviationReported = false;
        }
        else {
            if (gazeDeviationStartTime === null) {
                gazeDeviationStartTime = performance.now();
            }

            const duration =
                performance.now() - gazeDeviationStartTime;

            if (duration >= GAZE_DEVIATION_DURATION && !gazeDeviationReported) {
                const gazeEvent = {
                    type: "VISION_ANOMALY",
                    subtype: "GAZE_DEVIATION",
                    direction: gaze.direction,
                    durationSeconds: duration / 1000
                };

                console.log("GAZE EVENT:", gazeEvent);

                gazeDeviationReported = true;
            }
        }
    }

    if (headPoseResult) {
    const anomaly = ExamGuardHeadPose.isHeadPoseAnomaly(headPoseResult);

    if (anomaly) {
        if (headPoseAnomalyStartTime === null) {
            headPoseAnomalyStartTime = performance.now();
        }

        const duration =
            performance.now() - headPoseAnomalyStartTime;

        if (duration >= HEAD_POSE_DURATION) {
                headPoseStatus.textContent = "HEAD_POSE_ANOMALY";
            } else {
                headPoseStatus.textContent = "HEAD_POSE_WARNING";
            }
        } else {
            headPoseAnomalyStartTime = null;
            headPoseStatus.textContent = "HEAD_POSE_NORMAL";
        }
    }

    if (headPoseResult?.transformationMatrix) {
        console.log(
            "Transformation matrix:",
            headPoseResult.transformationMatrix
        );
    }

    console.log("Face detection result:", result);

    if (result.faceCount === 0) {
        status.textContent = "FACE_NOT_DETECTED";
    } 
    else if (result.faceCount === 1) {
        status.textContent = "NORMAL";
    } 
    else {
        status.textContent = "MULTIPLE_FACES_DETECTED";
    }

    requestAnimationFrame(detectFaces);
}

startCamera();