---
name: vox-demo-video
description: Use when creating or editing a narrated Vox demo video, or reproducing its Playwright recording, voice input, audio mixing, and FFmpeg export workflow for another web app.
---

# Produce a Vox-style demo video

Record a working app using real browser interactions, a presentation wrapper, separate audio tracks, and a shared edit timeline. For the original scene sequence and source locations, read [references/vox-workflow.md](references/vox-workflow.md).

## Prepare and record

1. Inspect the app and existing demo files. Choose the URL, fixture, target length, output path and observable success states. Use a new output directory. Configure Playwright, Chrome, FFmpeg/FFprobe, voices and ports; historical scripts have hardcoded paths and overwrite files.
2. Plan a compact story: introduce, supply data, perform the main task, ask a contextual follow-up, explore results, finish on an overview. Write narration matching the visible actions.
3. Place the actual app in an HTML director wrapper with scene headings, animated cursor and click ripples. Vox used a 1920×1080 viewport and a 1760×832 browser panel. Check embedding policies and allow microphone/autoplay on the iframe.
4. Prepare narrator and question audio at natural speed. Vox used Python edge_tts, en-US-ChristopherNeural at rate +0% and pitch +0Hz, converted to 48 kHz PCM WAV. Microphone command files included 1.2 seconds leading silence and five seconds trailing silence for transport.
5. Launch installed Chrome through Playwright with microphone permission. For generated microphone input use:
   - --use-fake-device-for-media-stream
   - --use-fake-ui-for-media-stream
   - --use-file-for-fake-audio-capture=<wav>
   - --enable-blink-features=MediaStreamTrackWebSpeech

   Remove Playwright's default --mute-audio argument when needed. Test one native recognition turn first. Click the real controls; await final transcripts, actual API requests, rendered results and completed replies. Instrument native ASR/TTS events without replacing their implementation.
6. Capture JPEG frames through CDP Page.startScreencast, acknowledge each frame, and retain timestamps. Save capture.json with frames, audio events, exact reply text/voice/times, requests, clicks, cuts and assertions. Keep one consistent seconds-based clock.

## Assemble

CDP screencasting captures images; provide audio separately. For the original method, export the exact observed reply text through Windows System.Speech with the same installed voice at natural rate. This reconstructs reply audio; it is not captured browser audio. Measure exported durations and check their fit.

Remove only unvoiced waits. Merge cut intervals and remap frames, audio, captions and clicks identically. Assert that cuts never intersect speech. Preserve speaking speed; trim transport padding from question audio.

Deduplicate frame timestamps. Use FFmpeg concat with per-image durations and option framerate 1000 to preserve subsecond timing; encode at 30 fps H.264. Check summed frame durations against the audio clock.

Mix 48 kHz stereo: normalize voices, duck music under speech, add quiet clicks, prevent clipping and fade the end. Generate SRT subtitles and optionally embed mov_text. Word-count timing is approximate.

## Verify and deliver

Check FFprobe dimensions, frame rate, duration and streams. Verify native transcripts, demonstrated app states, speech overlap and silent gaps. Extract key frames from the encoded movie and inspect them; preview audio and action/narration alignment. Revise narration if its action order differs from the footage.

Deliver the MP4 and useful sidecars. Accurately disclose generated microphone speech, reconstructed reply audio and shortened waits. Uploading or submitting is a separate action requiring user authorization.

