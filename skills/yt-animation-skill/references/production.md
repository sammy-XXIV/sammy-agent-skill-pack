# Blender production workflow

## Brief, design and approval

Capture the screenplay version, genre/tone, duration, visual perspective, narration perspective, approved delivery settings and destination. Establish whether speech will be supplied, recorded/generated with authorization, or omitted. First-person writing does not imply a first-person camera; burned-in text is not a voice-over.

Give scenes and shots stable IDs. For each shot record the screenplay beat, duration/frame range, location/time, visible characters, emotional objective, action, framing/lens, camera trajectory, lighting state, sound/narration cue and dependencies. Use actual dialogue timing when available; label provisional timing. Sound and captions must not reveal a beat prematurely.

Maintain the character bible, asset register and set/prop continuity notes. Record approvals against identifiable artifact versions. Bundle important look, character, environment and performance decisions into a concrete review when possible. Do not repeatedly ask for permission to implement an approved design.

## Tools and feasibility

Locate Blender, inspect its version, devices, memory and asset libraries, and identify audio/export tools. Research rigging, mocap, asset or render options when they solve a demonstrated gap. Consult installed APIs and official version-matched documentation; animation, shader, sequencer and rendering properties can change. Verify tools before promising their capabilities.

Benchmark a representative set, hero character, production material and actual render engine. Measure warmed-up frame times, a short action sample, memory and storage. Estimate total render/export time with uncertainty. Proxy benchmarks do not establish final textured render performance.

On constrained hardware, preserve the approved look using smaller representative previews, targeted shot tests, optimization, reuse and resumable rendering. If full local production is infeasible, show a failing sample and the measured costs of a concrete alternative. Obtain any needed spending/upload authorization before remote execution. Do not quietly replace semi-realism with Workbench or smooth acting with repeated stills.

## Organized, modular Python

Scale the structure to the project; a useful arrangement is:

```text
project/
  brief/                 screenplay, shot plan, approvals, design bibles
  assets/                characters, rigs, sets, textures, source register
  scripts/               assembly, animation, cameras, lighting, rendering/export
  scenes/sc010/          shot .blend files and incremental versions
  renders/sc010/sh020/    separate preview and final passes
  audio/                 voice, dialogue, effects, music, mix
  delivery/              final export, captions and verification evidence
```

Operate on explicit scene/shot IDs and project-relative paths. Separate creation/import from animation, assembly, lighting and rendering, so camera changes do not regenerate character identity. Pass configuration explicitly and avoid import side effects that clear scenes or launch renders.

Syntax-check Python before execution, for example `python -m compileall -q project/scripts`. Then smoke-test changed Blender API operations in a disposable scene. Use Blender's Python failure exit-code option when supported, capture logs, and check process exit and expected artifacts. Syntax validation does not prove API compatibility.

Save incremental versions such as `sc010_sh020_v003.blend`. Preserve approved sources/finals and render each pass into its own directory so stale frames cannot enter the edit. Rerun affected shots rather than rebuilding the episode. Check resolved paths before moves or cleanup; request permission before destructive replacement/deletion. Pack or organize resources and reopen the delivery project to check links.

## Rigging and performance

Rig a coherent mesh with usable deformation, appropriate IK/FK, gaze and facial controls. Test shoulders, elbows, wrists, hips, knees and feet across the shot's action range. Fix weights and intersections before polish.

Block story poses, then animate weight transfer, balance, foot contacts, gait, reaches, grip, head lead/follow, gaze and emotional reactions. Add breathing, blinks and secondary motion after primary acting works. Use eased curves and constraints where appropriate; root translation alone is not walking. Watch for foot sliding, floating contact, disconnected limbs, jerky interpolation, dead eyes and hovering props.

Retarget and clean captured motion for the character's proportions and performance. When approved speech exists, time visible dialogue and facial acting to that track. Avoid invented talking animation that conflicts with narration-over-action scenes.

## Execution and rendering

Approve a representative look and motion sample before a long episode render. Review each scene's blocking, performance, cameras, lighting and continuity before final frames. Reduced samples/resolution are appropriate for clearly labeled previews.

Render final animation at the approved motion cadence. Six distinct poses per second encoded into a 24 fps file do not produce smooth 24 fps acting. Keep native resolution and cadence explicit. Use resumable sequences with distinct shot ranges, validate coverage, then assemble picture/audio. Finish an identified render pass before encoding it; never change frames already being consumed by the encoder.
