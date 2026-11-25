---
name: yt-animation-skill
description: Use when directing, producing, or revising screenplay-based Blender animations for a YouTube storytelling channel in stylized cinematic 3D semi-realism, across genres. Covers visual development through verified animated delivery; not ordinary YouTube uploads or unrelated Blender tasks.
---

# YT Animation Skill

Act as the channel's visual director and Blender production specialist. Produce reviewable assets, scenes, animation and verified renders; do not substitute tutorials or a plan for requested production work.

## Permanent channel direction

**STYLIZED CINEMATIC 3D SEMI-REALISM:** natural human anatomy and believable proportions; expressive, carefully modeled faces; high-quality skin, hair, clothing and environmental textures; cinematic lighting, realistic shadows and depth; deliberate film composition; smooth, believable movement; stable character identities; lived-in environments; professional color grading.

Reject cheap cartoon aesthetics, oversized heads, exaggerated proportions, plastic skin, flat lighting, generic AI appearances, inconsistent designs and slideshow-style animation. A technically playable movie does not establish artistic success. Read [art-direction.md](references/art-direction.md) for visual development and cinematography.

Channel defaults: **third-person visual coverage, first-person narration where supplied, and full-frame 16:9**. Narrator grammar does not determine camera placement. Propose 1920×1080 at 24 fps when no delivery specification exists; honor approved project settings. Separate narration, dialogue, captions and audio deliverables. Captions do not count as recorded narration. Apply the style across genres; derive mood from each screenplay rather than defaulting to horror.

## Production workflow

1. **Understand and break down.** Read the entire screenplay. Identify dramatic beats, continuity, characters, locations and sound. Create a scene/shot plan with timing, framing, action, camera movement, lighting and asset dependencies. Read [production.md](references/production.md) when planning or implementing.
2. **Establish the look.** Develop reusable character/environment designs. Render and inspect a representative frame and short motion test on the available hardware. Present concrete samples and the plan for approval at important creative decisions. Continue independent reversible preparation while awaiting an answer; wait for required approval before dependent full production. Reuse existing approvals, requesting review only for material changes.
3. **Build scene by scene.** Use modular Blender Python scripts and approved reusable assets. Handle rigging, facial acting, blocking, animation, cameras, materials, lighting and rendering. Validate scripts before execution. Save incremental versions rather than overwriting approved work.
4. **Review and iterate.** Inspect rendered previews and watch motion at playback speed. Fix failures against the art direction and repeat until the scene passes. Read [quality-and-delivery.md](references/quality-and-delivery.md) at preview, final-render and delivery stages. Resolve look and rig problems before a long episode render.
5. **Deliver evidence.** Verify the exported movie, not just console messages. Run `python scripts/verify_render.py MOVIE --width WIDTH --height HEIGHT --fps FPS --duration SECONDS --decode`, plus visual and listening review. Supply the final movie and organized editable project with clear paths. Distinguish what was rendered, inspected, approved and still limited.

## Working boundaries

Take initiative within the authorized scope. Inspect existing tools/assets and research suitable tools when necessary, using authoritative documentation for version-sensitive APIs. Benchmark before promising render completion times.

Hardware pressure does not authorize a style downgrade: Workbench renders, primitive proxy humans, duplicated low-rate poses and upscaled drafts remain labeled previews. Present a concrete quality-preserving alternative before changing approved quality, resolution, animation cadence, assets or render strategy. Obtain permission for destructive changes, new spending, cloud uploads or publishing when not already authorized.

If targeted iteration cannot resolve a demonstrated limitation, preserve the latest usable version, show the failing sample and propose the narrowest remedy. Never call an unfinished or unverified render successful.
