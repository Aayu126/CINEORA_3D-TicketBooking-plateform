import os
import subprocess
import sys

ffmpeg_path = os.path.abspath("bin/ffmpeg.exe")

remaining = [
    ("coolie", 'ytsearch1:COOLIE - Title Teaser Superstar Rajinikanth Sun Pictures'),
    ("toxic", 'ytsearch1:TOXIC - Title Teaser Yash Geetu Mohandas KVN Productions'),
    ("varanasi", 'ytsearch1:SSMB29 Mahesh Babu SS Rajamouli concept teaser'),
    ("ramayana", 'ytsearch1:Ramayana Ranbir Kapoor Nitesh Tiwari announcement official teaser'),
]

for name, search_query in remaining:
    out_file = os.path.join("videos", f"{name}.mp4")
    if os.path.exists(out_file) and os.path.getsize(out_file) > 1000000:
        print(f"Skipping {name}: already downloaded")
        continue

    print(f"\n--- Searching and downloading trailer for {name} ({search_query}) ---")
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--ffmpeg-location", ffmpeg_path,
        "--js-runtimes", "node",
        "-f", "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best",
        "--merge-output-format", "mp4",
        "-o", out_file,
        "--force-overwrites",
        search_query
    ]
    res = subprocess.run(cmd)
    if res.returncode != 0:
        print(f"Primary format failed for {name}, trying fallback best...")
        cmd_fallback = [
            sys.executable, "-m", "yt_dlp",
            "--ffmpeg-location", ffmpeg_path,
            "--js-runtimes", "node",
            "-f", "best",
            "-o", out_file,
            "--force-overwrites",
            search_query
        ]
        subprocess.run(cmd_fallback)

print("\n--- Remaining trailer downloads finished! ---")
