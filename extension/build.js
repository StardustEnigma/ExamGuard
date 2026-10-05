const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/models/faceDetector.js"],
    bundle: true,
    outfile: "dist/faceDetector.js",
    format: "iife",
    globalName: "ExamGuardVision",
    platform: "browser",
    sourcemap: true
}).then(() => {
    console.log("BUILD SUCCESSFUL");
}).catch((error) => {
    console.error("BUILD FAILED");
    console.error(error);
    process.exit(1);
});