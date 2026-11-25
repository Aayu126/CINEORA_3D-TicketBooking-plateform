import os
import subprocess
import sys

ffmpeg_path = os.path.abspath("bin/ffmpeg.exe")

trailers = [
    ("leo", "Po3jStA673E"),
    ("animal", "Dydmpfo68DA"),
    ("coolie", "qeVsfOAinMc"),
    ("toxic", "U2r_bB3P_k4"),
    ("war-2", "tQ0mzXRk-oM"),
    ("vikram", "OKBMCL-frPU"),
    ("varanasi", "7V6k7k7b2tM"),
    ("ramayana", "jPr_n8V1Q3A"),
]

os.makedirs("videos", exist_ok=True)

for name, ytid in trailers:
    out_file = os.path.join("videos", f"{name}.mp4")
    if os.path.exists(out_file) and os.path.getsize(out_file) > 1000000:
        print(f"Skipping {name}: already downloaded ({os.path.getsize(out_file)} bytes)")
        continue

    url = f"https://www.youtube.com/watch?v={ytid}"
    print(f"\n--- Downloading trailer for {name} ({url}) ---")
    
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--ffmpeg-location", ffmpeg_path,
        "--js-runtimes", "node",
        "-f", "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best",
        "--merge-output-format", "mp4",
        "-o", out_file,
        "--force-overwrites",
        url
    ]
    
    res = subprocess.run(cmd)
    if res.returncode != 0:
        print(f"Standard download failed for {name}, trying fallback best...")
        cmd_fallback = [
            sys.executable, "-m", "yt_dlp",
            "--ffmpeg-location", ffmpeg_path,
            "--js-runtimes", "node",
            "-f", "best",
            "-o", out_file,
            "--force-overwrites",
            url
        ]
        subprocess.run(cmd_fallback)

print("\n--- All trailer downloads completed! ---")
