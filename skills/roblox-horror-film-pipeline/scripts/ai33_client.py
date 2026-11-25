"""Reusable AI33.pro v3 TTS (Little Dude II) & Suno Instrumental BGM client.

Usage:
  python ai33_client.py credits
  python ai33_client.py voices [search_query]
  python ai33_client.py tts "<text>" <out.mp3> [voice_id] [speed]
  python ai33_client.py bgm "<prompt>" <out_dir>
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

BASE_URL = "https://api.ai33.pro"
DEFAULT_API_KEY = "YOUR_AI33_API_KEY"
DEFAULT_VOICE_ID = "elevenlabs_fBD19tfE58bkETeiwUoC"  # Little Dude II - Cartoon Character


def get_api_key() -> str:
    return os.environ.get("AI33_API_KEY", DEFAULT_API_KEY)


def _get_json(path: str) -> dict:
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        headers={"xi-api-key": get_api_key(), "User-Agent": "curl/8.0"},
    )
    with urllib.request.urlopen(req, timeout=25) as r:
        return json.loads(r.read().decode("utf-8"))


def _post_json(path: str, payload: dict) -> dict:
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "xi-api-key": get_api_key(),
            "Content-Type": "application/json",
            "User-Agent": "curl/8.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def _post_multipart(path: str, fields: dict) -> dict:
    boundary = "----AI33Skill" + uuid.uuid4().hex
    parts = [
        f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode("utf-8")
        for k, v in fields.items()
    ]
    parts.append(f"--{boundary}--\r\n".encode("utf-8"))
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=b"".join(parts),
        headers={
            "xi-api-key": get_api_key(),
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "User-Agent": "curl/8.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def _download(url: str, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        dest.write_bytes(r.read())
    return dest


def poll_task(task_id: str, max_wait: int = 240, interval: float = 3.0) -> dict:
    t0 = time.monotonic()
    while time.monotonic() - t0 < max_wait:
        time.sleep(interval)
        try:
            data = _get_json(f"/v1/task/{task_id}")
        except urllib.error.HTTPError as he:
            if he.code == 429:
                time.sleep(10.0)
                continue
            raise
        status = data.get("status")
        if status in ("done", "completed"):
            return data
        if status in ("error", "failed"):
            raise RuntimeError(f"AI33 task {task_id} failed: {data}")
    raise TimeoutError(f"Timed out waiting for AI33 task {task_id}")


def synth_tts(text: str, out_mp3: Path, voice_id: str = DEFAULT_VOICE_ID, speed: str = "1") -> Path:
    for attempt in range(8):
        try:
            res = _post_multipart("/v3/text-to-speech", {
                "voice_id": voice_id,
                "text": text,
                "speed": str(speed),
                "with_transcript": "false",
            })
            if not res.get("success") or not res.get("task_id"):
                raise RuntimeError(f"TTS create error: {res}")
            done = poll_task(res["task_id"], max_wait=120, interval=2.5)
            url = done.get("metadata", {}).get("audio_url")
            if not url:
                raise RuntimeError(f"No audio_url in task response: {done}")
            return _download(url, Path(out_mp3))
        except urllib.error.HTTPError as he:
            if he.code == 429:
                time.sleep(min(12.0 * (attempt + 1), 60.0))
                continue
            raise
    raise RuntimeError("TTS failed after 8 attempts")


def generate_bgm(prompt: str, out_dir: Path, instrumental: bool = True) -> list[Path]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    res = _post_json("/v1s/task/music-generation", {
        "create_mode": "simple",
        "gpt_description_prompt": prompt,
        "make_instrumental": instrumental,
    })
    if not res.get("success") or not res.get("task_id"):
        raise RuntimeError(f"Suno BGM create error: {res}")
    done = poll_task(res["task_id"], max_wait=240, interval=3.5)
    (out_dir / "suno_meta.json").write_text(json.dumps(done, indent=2), encoding="utf-8")
    urls = done.get("metadata", {}).get("all_audio_urls") or []
    if not urls and done.get("metadata", {}).get("audio_url"):
        urls = [done["metadata"]["audio_url"]]
    saved = []
    for i, url in enumerate(urls):
        saved.append(_download(url, out_dir / f"bgm_{i}.mp3"))
    return saved


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "credits":
        print(json.dumps(_get_json("/v1/credits"), indent=2))
    elif cmd == "voices":
        q = sys.argv[2] if len(sys.argv) > 2 else ""
        path = f"/v1/shared-voices?search={urllib.parse.quote(q)}&page_size=20" if q else "/v2/voices?page_size=50"
        data = _get_json(path)
        for v in data.get("voices", []):
            print(f"elevenlabs_{v['voice_id']} | {v['name']}")
    elif cmd == "tts":
        out = synth_tts(
            sys.argv[2],
            Path(sys.argv[3]),
            sys.argv[4] if len(sys.argv) > 4 else DEFAULT_VOICE_ID,
            sys.argv[5] if len(sys.argv) > 5 else "1",
        )
        print(f"SAVED {out} ({out.stat().st_size} bytes)")
    elif cmd == "bgm":
        files = generate_bgm(sys.argv[2], Path(sys.argv[3]))
        for f in files:
            print(f"SAVED {f} ({f.stat().st_size} bytes)")
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
