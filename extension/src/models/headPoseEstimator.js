import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let faceLandmarker = null;

export async function initializeHeadPoseEstimator() {
    const vision = await FilesetResolver.forVisionTasks(
        "../dist/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "../models/face_landmarker.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 2
    });

    console.log("Face Landmarker initialized");
}

export function estimateHeadPose(videoElement) {
    if (!faceLandmarker) {
        throw new Error("Face landmarker is not initialized");
    }

    const result = faceLandmarker.detectForVideo(
        videoElement,
        performance.now()
    );

    return result;
}