# Preview, iteration and delivery gates

## Reviewable creative decisions

Show character views, an environment/look frame and a short motion sample before committing to episode rendering. Choose demanding samples that expose likely failures: a close-up, hand/prop contact or moving body under intended lighting. Present the samples with the plan, asset needs, measured performance and recommended route. Approval concerns creative commitments and material quality changes; routine implementation can continue within an approved design.

Record decisions against versions. A camera correction does not reopen approved character choices. A proposed identity, style, quality, aspect, cadence, narration, external-cost or render-strategy change needs review when not already authorized. Do not present a downgrade as an invisible implementation detail.

## Inspect and iterate

Open rendered images and watch clips at intended playback speed. Console logs and metadata cannot judge artistic quality.

| Area | Evidence to inspect |
|---|---|
| Anatomy and identity | Reference views versus close-ups; proportions; stable hair, skin, clothing and identifying features |
| Performance | Weight, balance, contacts, gait, grip, expression, gaze, blinks, speech timing and secondary motion |
| Materials | Skin response, hair detail, fabric scale, UV seams, intersections and texture resolution |
| Set continuity | Prop state, doors, lights, time, geography and positions across cuts |
| Camera | External versus POV placement, composition, eyelines, headroom, action visibility and movement endpoints |
| Lighting and grade | Motivated sources, contact shadows, readable faces, depth, skin tone and shot continuity |
| Motion and sound | Smooth playback, no stutter/repeated stills masquerading as motion, speech availability, cue timing and mix |

Compare against the approved sample. Fix the responsible asset, rig, action or shot rather than hiding defects under a filter. Recheck affected cuts. Iterate until the accepted standard is met. If targeted iterations expose a missing capability/resource, preserve the usable version, show evidence and propose the narrowest remedy rather than consuming an unbounded budget.

## Verify the actual delivery

1. Check renderer exit status and complete current frame ranges. Inspect cuts and first/last frames; detect corrupt/missing frames. Save logs and native resolution/cadence settings. Output fps alone does not prove unique animated frames.
2. Assemble only the completed pass. Inspect actual width/height, display aspect, frame rate, duration, streams and playable ending. For the channel default, fill 16:9 without added letterbox bars. Check pixel/sample aspect and orientation too.
3. Run the bundled helper using approved values and full decoding:

   ```text
   python scripts/verify_render.py delivery/final.mp4 --width 1920 --height 1080 --fps 24 --duration 180 --decode --report delivery/media-check.json
   ```

   FFprobe/FFmpeg must be on PATH or supplied explicitly. Use `--allow-no-audio` only for intentionally silent work. The duration shown is an example, not a channel runtime. The helper checks media integrity, not art direction, unique motion cadence, speech content or black bars.
4. Watch the full export and listen to its mix for continuity, synchronization, missing shots, dead air, clipping and ending truncation. Inspect representative frames at delivery size. Source review alone cannot prove that captions, grade and encoding preserved the look.
5. Reopen the final `.blend` or copied delivery project and check links, textures, rigs, cameras and packed/relative audio. Retain source rights and asset dependencies in the register.

## Completion language

Distinguish plan, proxy/animatic, look preview, motion preview, final render and verified final export. Proxy humans and camera-only movement are not finished semi-realistic character animation. Upscaling does not create native resolution. Captions do not establish recorded narration.

Deliver the agreed movie and editable project with clear filenames, location and evidence. Preserve the user's destination preference, including a movie directly in Downloads when requested. State material limitations plainly. Report technical checks separately from visual review: decoding success cannot certify film-quality faces or movement.
