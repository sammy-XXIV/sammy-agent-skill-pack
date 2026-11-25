# Original Vox workflow

## Evidence and sources

The historical report C:/Users/Dell/.cache/vox-demo-three/verification.json records a 112.245-second export to C:/Users/Dell/Downloads/vox-demo-three-charts.mp4: 1920×1080, 30 fps H.264, 48 kHz stereo AAC and mov_text subtitles. It records four native recognition turns, three chart types, zoom [100,70,100,70] and a longest speech gap of about 1.2 seconds. This is saved evidence, not validation of a new run.

The recorded deployment was https://vox-blue.vercel.app and input fixture C:/Users/Dell/vox/demo-data/vox-revenue-sample.csv. Check their current availability before reuse.

Source directory: C:/Users/Dell/.cache/vox-demo-three/

| File | Purpose |
| --- | --- |
| prepare.py | Narration/questions, TTS generation, transport padding, assets.json |
| director.html | Branded wrapper, app iframe, scene labels, cursor and ripples |
| server.cjs | Local director server and app proxy |
| record.cjs | Playwright interactions, CDP capture, native ASR/TTS logs and assertions |
| export-replies.ps1 | System.Speech export of exact recorded utterances |
| align-zoom.py | Corrected narration matching the zoom order |
| render.py | Silent cuts, shared clock, frame concat, mixing, captions and export checks |
| check-export.py | Extracts encoded zoom/overview frames for visual inspection |

Related sources: ../vox-demo/audio-assets.py creates music and click assets; ../vox-demo-voice-v2/ holds earlier microphone probes. Despite its name, ../vox-demo-final/ is an earlier two-turn version that excludes an incomplete optional request. Use vox-demo-three as the three-chart baseline.

If cache files are missing, implement the method from SKILL.md. Historical scripts are not bundled with this skill.

## Scene contract

1. Intro, open canvas, upload the 18-month revenue CSV and collapse sources.
2. Say "Show me a bar chart of monthly revenue." Expect one bar chart.
3. Click June 2025, then ask "What changed at the selected point?" Keep one chart; assert the second agent request contains selection.rowIndex = 1.
4. Clear selection. Say "Add a revenue line chart." Expect two charts; zoom out from 100% to 70%.
5. Say "Add a pie chart for revenue above thirty thousand." Expect three charts and six pie sectors for this fixture.
6. Zoom in to 100%, back out to 70%, finish with all three views.

The original recorder asserted four /api/agent requests and no page errors. These exact counts are scenario-specific.

## Adaptation order and pitfalls

Inspect copies before executing: prepare assets/director/server → record → export replies → align zoom narration → render → extract final frames and inspect. prepare.py reads older voice-v2 files; render.py reads music/click WAVs from vox-demo. Copy or configure these dependencies first.

Chrome received synthesized questions through its microphone device; native speech recognition and agent requests stayed real. Replies used exact observed text and the installed Microsoft Mark voice exported with System.Speech, rate 0. Narration/questions used Christopher. This was separately assembled audio, not a browser audio recording.

Retain speechStart/speechEnd padding trims, cuts that avoid speech, overlapping-speech checks and shared timestamp mapping. The concat list repeats the last frame and checks duration sums. Original subtitles used eleven-word chunks with approximate timing.

Original zoom narration described the opposite action order. align-zoom.py replaced it with "Zoom in for detail. Pull back to compare all three views." Inspect the encoded frames against the final wording.

Historical scripts embed an npm-cache Playwright path, FFmpeg paths, selectors, deployment URL and ports. Discover current values instead of assuming these still work. Keep credentials out of recordings and skill files.

