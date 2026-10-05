const video = document.getElementById("video");
const status = document.getElementById("status");

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

            console.log("MediaPipe initialization successful");

            status.textContent = "Face detector ready";

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

    console.log("Face detection result:", result);

    if (result.faceCount === 0) {
        status.textContent = "No face detected";
    } 
    else if (result.faceCount === 1) {
        status.textContent = "1 face detected";
    } 
    else {
        status.textContent = `${result.faceCount} faces detected`;
    }

    requestAnimationFrame(detectFaces);
}

startCamera();