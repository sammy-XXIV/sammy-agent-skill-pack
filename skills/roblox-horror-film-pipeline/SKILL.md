---
name: roblox-horror-film-pipeline
description: >-
  End-to-end production pipeline for viral "In This World..." animated 3D Roblox story & horror YouTube videos
  via Roblox Studio MCP, AI33.pro natural TTS voiceover (Little Dude II saved with API key), Suno BGM, synced SFX,
  word-by-word White/Yellow pop captions, smooth slow-mo 60fps capture, and high-CTR YouTube thumbnail formats.
  Includes the viral "In This World" visual style (classic blocky rectangular R6/R15 bodies, cylindrical head,
  textured clothing, 3D hair, expressive 2D cartoon faces with white eye catchlights, DepthOfField background
  blur, voxel trees, pastel houses, 1.5-2.5s fast cuts with literal prop close-ups) plus all critical bug fixes
  (anti-glow lighting, zero-MeshPart CDN invisibility fix, anti-grey D3D11 MCP capture rules).
---

# Roblox Story & Horror Film Production Pipeline ("In This World" Style)

Complete battle-tested workflow for producing viral *"In This World..."* 3D Roblox story and horror videos (`1280×720` or `1080×1920`, `60 fps`) with natural AI33.pro narration, Suno background music, synced SFX, word-by-word White/Yellow pop captions, crisp Depth-of-Field blocky graphics, and niche-proven YouTube thumbnails.

## Saved Voiceover & Music API Credentials (AI33.pro)

- **Base URL:** `https://api.ai33.pro`
- **Auth Header:** `xi-api-key: sk_7v6zhs94i0nol8honly1j58vtbmmiyle3kie2bm4ifynvl7b` (override with `AI33_API_KEY` env var if rotated)
- **Saved Default Voice:** `Little Dude II - Cartoon Character`
  - **v3 `voice_id`:** `elevenlabs_fBD19tfE58bkETeiwUoC` *(must include `elevenlabs_` provider prefix for v3 TTS)*
  - **Natural Settings (REQUIRED):** `speed = "1"`, **0% pitch shift** (pure raw voice — never pitch-shift or speed-up unless explicitly requested)
- **Helper Client:** [ai33_client.py](./scripts/ai33_client.py) — reusable CLI & Python helper for credits, voice search, v3 TTS, and Suno instrumental BGM.

### Exact AI33.pro Endpoints (Do NOT Use Legacy v1 TTS)

1. **Check Credits:**
   - `GET https://api.ai33.pro/v1/credits` (header `xi-api-key`)
2. **List / Search Voices:**
   - Account voices: `GET https://api.ai33.pro/v2/voices?page_size=50`
   - Shared library: `GET https://api.ai33.pro/v1/shared-voices?search=<query>&page_size=20`
   - Prefix returned ElevenLabs `voice_id` with `elevenlabs_` when calling v3 TTS.
3. **Text-to-Speech (v3 — `multipart/form-data`, NOT JSON!):**
   - `POST https://api.ai33.pro/v3/text-to-speech`
   - *Note:* `POST /v1/text-to-speech/{id}` fails with `"please use api v3 for this endpoint"`.
   - Form fields:
     - `voice_id`: `elevenlabs_fBD19tfE58bkETeiwUoC`
     - `text`: full continuous scene paragraph
     - `speed`: `"1"` (valid `0.5–1.5`)
     - `with_transcript`: `"false"` (or `"true"` for timestamps)
   - Returns `{ "success": true, "task_id": "<uuid>" }`.
4. **Suno Instrumental Background Music (`application/json`):**
   - `POST https://api.ai33.pro/v1s/task/music-generation`
   - Body:
     ```json
     {
       "create_mode": "simple",
       "gpt_description_prompt": "Dark atmospheric horror suspense cinematic underscore, slow haunting minor piano, eerie low cello drone, subtle creepy tension pulse, mysterious storytelling background music, no drums, instrumental",
       "make_instrumental": true
     }
     ```
   - Returns `{ "success": true, "task_id": "<uuid>" }`. When done, `metadata.all_audio_urls` contains **2 complementary ~3–3.5 min tracks** (~6.5 min combined with zero repetition).
5. **Poll Any Async Task (TTS or Suno):**
   - `GET https://api.ai33.pro/v1/task/{task_id}` until `status` is `"done"` or `"completed"`.
   - Download `metadata.audio_url` (TTS) or `metadata.all_audio_urls` (Suno).
   - **Rate-Limit Guard:** Max `1–2` concurrent workers, `≥1.5s` delay between POSTs, `2.5–3.0s` poll interval, exponential backoff (`12s × attempt`, max `60s`) on HTTP `429`.

---

## Mandatory Production Order

> **CRITICAL RULE — 1.0× NORMAL SPEED & NATURAL GAPS (NEVER RUSH VOICE OR VIDEO):**
> Keep both the **voice** and the **video** at **1.0× normal speed** (`speed="1"`, `0%` pitch shift, `1.0×` video playback):
> - **Never speed up the voice (`1.15x`) or speed up the video shots (`1.3x–1.5x`) to close gaps** — that makes the speech and animation feel rushed.
> - **Include normal natural pauses between sentences** (use `<break time="0.75s" />` between normal sentences and `<break time="1.15s" />` after dramatic reveals, or place lines at their natural `subtitles.ass` timestamps with `0.8–1.4s` breathing gaps).
> - **Let the Suno horror BGM + ambience fill the pauses** — with continuous dark background music underneath, normal `0.8–1.5s` pauses feel suspenseful and cinematic instead of empty dead air.

### Phase 1: Natural Narration (With Balanced Pauses) + Suno Horror BGM

1. Structure the script into **natural 1–2 sentence beats** (or scene chunks with `<break time="0.7s" />` between sentences and `<break time="1.1s" />` after cliffhanger lines).
2. Kick off the Suno horror BGM task first (runs asynchronously in ~30–60s).
3. Generate narration via `POST /v3/text-to-speech` (`voice_id="elevenlabs_fBD19tfE58bkETeiwUoC"`, `speed="1"`, **no pitch shift**).
4. Convert each MP3 to 44.1 kHz mono WAV trimming only dead leading/trailing silence:
   ```
   silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.15:stop_threshold=-45dB
   ```
5. Build a **balanced, suspenseful timeline (never rushed, never dead)**:
   - Opening lead: `0.80s`
   - Between normal sentences: `0.55–0.75s`
   - After dramatic reveals / whispers /SFX hits: `0.95–1.30s`
   - Major scene / act transition: `1.20–1.60s`
   - Final outro hold: `2.0–2.5s`
6. Crossfade the 2 Suno tracks seamlessly (`acrossfade=d=8:c1=tri:c2=tri`), trim to exact `total_dur`, add `2.0s` fade-in and `3.5s` fade-out (`44.1 kHz stereo WAV`).

---

### Phase 2: Viral "In This World" Graphics Style, Rigs & Bug-Fix Checklist

Apply the viral *"In This World"* Roblox story visual signature AND all four hard-won bug fixes in Roblox Studio (`Edit` DataModel via `execute_luau`) before pressing Play:

#### Viral Visual Signature ("In This World" Look)
1. **Classic Blocky Rectangular Bodies (NOT Rounded Capsules):**
   - Use sharp rectangular blocky limbs and torso (`Part` with `Shape = Enum.PartType.Block`, **no** `SpecialMesh` on limbs/torso):
     - `Torso`: `Size = Vector3.new(2, 2, 1)` (or R15 `UpperTorso` `2×1.6×1` + `LowerTorso` `2×0.4×1` flush blocks)
     - `LeftArm` / `RightArm` / `LeftLeg` / `RightLeg`: rectangular blocks totaling `1×2×1` each.
   - **Classic Cylindrical Head Only:** `Head` is `Part` (`Size = Vector3.new(2, 1, 1)` or `1.25×1.25×1.25`) + `SpecialMesh` (`MeshType = Enum.MeshType.Head`, `Scale = Vector3.new(1.25, 1.25, 1.25)`).
2. **Textured Clothing & Layered Details (Never Plain Flat Bricks):**
   - Apply real `Shirt` and `Pants` textures (or build multi-part 3D clothing overlays: hoodie pocket + drawstrings + collar cuffs, plaid flannel grid strips, jacket lapels, tie, denim seam lines, shoes/sole trim) so outfits look rich and tactile.
3. **Expressive 2D Anime/Cartoon Face Rig (`FaceGui` on `Head.Front`):**
   - Large glossy black cartoon eyes with **two crisp white circular catchlights** (`UICorner` `CornerRadius = 1`) so characters feel alive.
   - Dynamic mouth & eyebrow states switchable via character attribute `Expression` (`"Happy"`, `"Talking"`, `"Shocked"`, `"Sad"`, `"Angry"`, `"Scared"`, `"Blink"`):
     - Blink automatically every `2.5–4.0s` (`0.12s` closed) and animate mouth open/closed while speaking.
4. **High-Clarity Lighting + Depth-of-Field Background Blur (`DepthOfFieldEffect`):**
   - Even in night/horror scenes, keep characters clearly lit and readable (`Ambient >= Color3.fromRGB(95, 105, 125)`, `OutdoorAmbient >= Color3.fromRGB(120, 130, 150)`); for daytime/story scenes use bright sunny lighting (`Brightness = 2.6`, `Ambient = Color3.fromRGB(145, 150, 165)`, `OutdoorAmbient = Color3.fromRGB(165, 175, 190)`).
   - Add `Lighting.DepthOfFieldEffect` to blur background houses/trees softly so foreground characters pop like a Blender render:
     ```lua
     local dof = Lighting:FindFirstChildOfClass("DepthOfFieldEffect") or Instance.new("DepthOfFieldEffect", Lighting)
     dof.FocusDistance = 12 -- dynamically track (Camera.CFrame.Position - SubjectHead.Position).Magnitude
     dof.InFocusRadius = 10
     dof.FarIntensity = 0.65
     dof.NearIntensity = 0.0
     ```
5. **Stylized Voxel Environment & Literal Story Props:**
   - **Voxel Trees:** Brown rectangular trunk (`1.5×7×1.5`) topped with `4–6` offset bright-green cube blocks (`Color3.fromRGB(105, 185, 55)` and `Color3.fromRGB(130, 210, 65)`).
   - **Pastel Clapboard Houses:** Clean pastel siding (` Brick` / `WoodPlanks` with subtle contrast), crisp white window frames (`0.25` stud trim), white garage doors with indented panels, clean gray sidewalks with curb joints, and dashed asphalt roads.
   - **Fast Cuts (`1.5–2.5s`) + Literal Prop Close-Ups:** Every key noun mentioned in the narration (e.g., wrist button, phone screen, framed hallway photo, math test with big red `F`, pizza box, clock, newspaper) MUST have a dedicated 3D prop and an extreme close-up camera cut (`FOV = 35–45`) right when the word is spoken.

#### Fix 1: Anti-Invisible Characters (Zero `MeshPart`s / Zero External `FileMesh`es)
- `Players:CreateHumanoidModelFromDescription` creates `MeshPart`s whose CDN meshes can silently fail to stream during recording, leaving floating hair, faces, and backpacks.
- **Solution:** Build or convert **every** character in the cast to **100% engine-native `Part` blocks** (plus `SpecialMesh(Head)` on `Head` only, and multi-part sculpted blocky/spiky hair wedges & bricks):
  - When converting existing `MeshPart` rigs, skip `BaseWrap` children (`BaseWrap` throws if parented to a regular `Part`).
  - Attach faces cleanly via `SurfaceGui` (`FaceGui`) on `Head.Front`.
- **Mandatory Audit Before Recording:** Run a Luau check across every cast model confirming:
  - `MeshPart` count == `0`
  - External `FileMesh` count == `0`
  - All `Motor6D` joints intact, `0` broken welds, `0` invisible parts (`Transparency == 1` except `HumanoidRootPart`)

#### Fix 2: Anti-Glow Skin & Lighting Calibration (Zero Radioactive Faces/Hands)
Glowing white faces/hands happen when bright lights + low Bloom threshold + reflective skin blow out pale colors.
- **Lighting / Post-Processing:**
  - `BloomEffect.Threshold = 2.4` *(never `< 1.5`)*
  - `BloomEffect.Intensity = 0.20`
  - `BloomEffect.Size = 24`
- **Character & Scene Lights:**
  - Delete all character `RimLight`s.
  - Cap nearby porch, hallway, and room `PointLight.Brightness` to **`1.45–2.0`** (never `> 3.0` near characters).
  - Set skin parts to `Material = Enum.Material.SmoothPlastic`, `Reflectance = 0.02` *(never `> 0.05`)*.
  - Position back hair flush against head (`z = 0.38`) so backlighting cannot leak through head/hair seams.

#### Fix 3: Anti-Grey MCP `video_capture` Rules (Direct3D11 / Intel UHD)
- **NEVER add `Lighting.Atmosphere`!** `Atmosphere` breaks MCP `video_capture` into solid `#1A1B1E` grey frames. Always use classic `Lighting.FogStart`, `Lighting.FogEnd`, and `Lighting.FogColor`.
- **Keep Device Emulator ON** (e.g., `1072×592` scaled 16:9 HD, touch controls OFF) and keep the Roblox Studio window **uncovered** (never hidden under a maximized window).
- **Grey-Frame Verification:** On every captured clip, sample the center crop (`crop=iw/2:ih/2:iw/4:ih/4,scale=8:8`) and assert `max(rgb) - min(rgb) >= 12` (center crop prevents the white top-left Roblox CoreGui icon from fooling the check).

#### Fix 4: Readable Props & Framing
- Put `UIPadding` (at least `8%` horizontal padding) + `TextScaled = true` on all `SurfaceGui` signs, phones, and newspapers so edges never clip.
- Verify flat props (newspapers/books on tables) face the camera right-side-up (`NormalId.Top` rotated to match camera look vector) via a quick `screen_capture` check before recording.

---

### Phase 3: Beat-Synced Director & Hands-Free Zero-Drop 60fps Capture

1. **Director Script (`StarterPlayer.StarterPlayerScripts.<FilmDirector>`):**
   - Reads `workspace` attributes:
     - `TimeScale` (`0.5` for capture, `1.0` for live preview)
     - `SeekTime` (numeric seconds — reset with `nil` then target value to force attribute-changed jump)
     - `SlateVisible` (`true` shows a fullscreen magenta `Color3.fromRGB(255, 0, 255)` sync slate GUI)
   - Cut camera every `3–8s` across distinct sets, props, and character reactions synchronized to the exact Phase 1 scene timestamps.
2. **Slow-Mo Zero-Drop Recording Loop (`TimeScale = 0.5`):**
   - Unfocused Studio renders at a rock-steady `15.0 fps (0 drops)`. Recording at `TimeScale = 0.5` yields **true locked `30` unique rendered frames per film second** (`0` dropped frames).
   - Split total film into `12.0s` film sections (`24.0s` capture time — fits comfortably inside MCP's `30s` capture cap):
     - Section `0`: `start = 0.0`, `film_dur = 12.5`, `lead_rec = 0.0`
     - Section `i >= 1`: `start = 12.5 + (i - 1) * 12.0`, `seek = start - 0.25`, `lead_rec = 0.5`, `film_dur = 12.0` (final section = remaining exact seconds).
   - **Per-Section Atomic Launch (ONE parallel turn — critical!):**
     1. `video_capture(datamodel_type="Client", is_start=True)`
     2. `execute_luau(Client)`:
        ```lua
        workspace:SetAttribute("TimeScale", 0.5)
        workspace:SetAttribute("SeekTime", nil)
        workspace:SetAttribute("SeekTime", <seek>)
        task.wait(0.05)
        workspace:SetAttribute("SlateVisible", false)
        return "GO_<idx>"
        ```
        *(Never add extra `task.wait` > `0.05s` or `slate_end` exceeds ~5s and clips run short of 24s!)*
     3. `schedule(DurationSeconds=30)` (or `26` for short final clip).
   - **Per-Section Stop (ONE parallel turn):**
     1. `video_capture(datamodel_type="Client", is_start=False)`
     2. `execute_luau(Client)`: `workspace:SetAttribute("SlateVisible", true); return "SLATE_ON"`
   - **Verify Between Captures (NEVER run FFmpeg during an active capture!):**
     - Detect magenta slate end (`r > 200 and g < 60 and b > 200` → first non-magenta frame timestamp), check `avail_rec >= film_dur / time_scale - 0.15`, check `observed_capture_drops == 0`, check center-crop non-grey `spread >= 12`.
3. **Stop Play Mode & Compile (`1280×720`, `60 fps`, Black Cinema Bars):**
   - Call `start_stop_play(is_start=False)` first.
   - Trim & speed up every section cleanly (`FFMPEG = C:\Users\Dell\ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe`):
     ```
     setpts=(PTS-STARTPTS)*0.500000,fps=60,
     scale=1280:720:force_original_aspect_ratio=decrease:flags=lanczos,
     pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,
     drawbox=x=0:y=0:w=1280:h=58:color=black:t=fill,
     drawbox=x=0:y=662:w=1280:h=58:color=black:t=fill,
     tpad=stop_mode=clone:stop_duration=0.3
     ```
   - `drawbox` top & bottom (`h=58`) creates sleek cinema bars and completely hides top-left Roblox CoreGui icons.
   - Encode sections (`libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -video_track_timescale 90000`) and concat (`-c copy -movflags +faststart`).

---

### Phase 4: Pro Stereo 3-Layer Audio Mix, QA, Thumbnail & Cleanup

1. **Synthesize Story-Synced Horror SFX (`44.1 kHz` WAV):**
   - Place SFX cues (footsteps, clock chimes, window clicks, phone rings, door knocks/slams, blackout crash, booms, stings) at the exact Phase 1 timestamps.
2. **3-Layer Stereo Mix (Voice + Suno BGM + SFX):**
   ```
   [0:a]highpass=f=75,acompressor=threshold=-20dB:ratio=2.2:attack=10:release=140:makeup=2dB,volume=1.18,pan=stereo|c0=c0|c1=c0,asplit=3[v_mix][v_sc1][v_sc2];
   [1:a]volume=0.34[bgm_in];
   [bgm_in][v_sc1]sidechaincompress=threshold=0.03:ratio=2.4:attack=35:release=450:makeup=1[bgm_duck];
   [2:a]highpass=f=45,volume=0.50,pan=stereo|c0=c0|c1=c0[sfx_in];
   [sfx_in][v_sc2]sidechaincompress=threshold=0.03:ratio=3.2:attack=20:release=260:makeup=1[sfx_duck];
   [v_mix][bgm_duck][sfx_duck]amix=inputs=3:duration=longest:dropout_transition=0:normalize=0,alimiter=limit=0.95[out]
   ```
   - Mux onto silent 60fps MP4 with `-c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart`.
   - Verify with full FFmpeg decode (`-f null -`) + `volumedetect` (`mean_volume` around `-18 to -19 dB`, `max_volume` around `-0.4 dB`, zero clipping).
3. **Visual QA:** Extract 4–6 frames across the video and inspect via `read_file` to confirm crisp Depth-of-Field 3D, zero glow, intact blocky characters, expressive faces, readable props, and clean framing.
4. **Word-by-Word White/Yellow Pop Captions (Optional / Viral "In This World" Style):**
   - Pass `with_transcript="true"` to `POST /v3/text-to-speech` (or generate word timings proportionally across each sentence) to get word-level `(start, end, word)` timestamps.
   - Generate an `.ass` subtitle file displaying **1–2 uppercase words at a time** at lower-center chest height (`Alignment = 2`, `MarginV = 155` on 1080p), heavy bold font (`Arial Black` / `Impact`, size `76`), thick black outline (`Outline = 5.5`, `Shadow = 2`), alternating **White (`&H00FFFFFF`)** on normal words and **Bright Yellow (`&H0000EAFF` in BGR ASS format)** on emphasis/action words (numbers, verbs, key nouns).
5. **High-CTR YouTube Thumbnail (`1280×720` JPG — 3 Proven Niche Formats):**
   Choose from the 3 proven *"In This World / Roblox Story"* thumbnail formats (reference folder: `C:\Users\Dell\Downloads\Roblox_Story_Thumbnails_Reference`):
   - **Format A — Multi-Panel Split (3 or 4 vertical slices, 0 title text or 1 lower-center caption word per panel):** Best for compilations or multi-rule stories (`ref_01`–`ref_06`, `ref_08`, `ref_09`).
   - **Format B — Single Dramatic 3D Scene + Top Bold White Banner Text:** Classic blocky Roblox character in an extreme emotional pose (crying/shocked/trapped) with a clean dark-backed top banner (`ref_07`).
   - **Format C — High-Contrast Night/Horror Confrontation:** Protagonist in foreground under warm light with shadowy entity/threat right behind them + bold 2–3 word hook on left.
   - Scale/crop to exact `1280×720` JPG (`-q:v 2`) and save to `C:\Users\Dell\Downloads\<Project>_Thumbnail.jpg`.
6. **Cleanup Junk:**
   - Remove intermediate section clips, retimed clips, scratch check frames, temp WAV caches, and `%LOCALAPPDATA%\Roblox\tmp-capture-storage\mcp` while **preserving** the final MP4, thumbnail JPG, `.rbxl` project file, and scripts.

### Windows / PowerShell 5.1 Reminders
- Never use `&&` in PowerShell 5.1 (use `;` or `if ($?) { ... }`).
- For multiline inline Python, pipe a single-quoted here-string: `@' ... '@ | python -`.
- FFmpeg binary path on this machine: `C:\Users\Dell\ffmpeg-7.1.1-essentials_build\bin\ffmpeg.exe` (and `ffprobe.exe`).
