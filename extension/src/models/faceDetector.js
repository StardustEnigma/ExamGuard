import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let faceDetector = null;

export async function initializeFaceDetector() {
    const vision = await FilesetResolver.forVisionTasks(
        "../dist/wasm"
    );

    faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "../models/blaze_face_short_range.tflite",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        minDetectionConfidence: 0.5
    });

    console.log("MediaPipe Face Detector initialized");
}

export function detectFaces(videoElement) {
    if (!faceDetector) {
        throw new Error("Face detector is not initialized");
    }

    const result = faceDetector.detectForVideo(
        videoElement,
        performance.now()
    );

    const faceCount = result.detections.length;

    return {
        faceDetected: faceCount > 0,
        faceCount: faceCount,
        multipleFaces: faceCount > 1,
        detections: result.detections
    };
}