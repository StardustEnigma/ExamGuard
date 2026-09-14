export type AudioEventType = "AUDIO_SPEECH" | "AUDIO_NOISE" | "AUDIO_MULTIPLE_SPEAKERS" | "AUDIO_WHISPER";
export interface AudioEvent {
    type: AudioEventType;
    timestamp: string;
    confidence: number;
    metrics: {
        volume: number;
        speechEnergy: number;
        dominantFrequency: number;
    };
}
export declare class AudioAnalyzer {
    private audioContext;
    private analyser;
    private microphone;
    private stream;
    private frequencyData;
    private running;
    private callback;
    start(onEvent: (event: AudioEvent) => void): Promise<void>;
    private analyze;
    private calculateVolume;
    private calculateSpeechEnergy;
    private calculateDominantFrequency;
    private createEvent;
    stop(): void;
    private cleanup;
}
//# sourceMappingURL=audioAnalyzer.d.ts.map