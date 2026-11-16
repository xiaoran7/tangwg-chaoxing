import subprocess, os, base64, urllib.request, json

text = "Here is the business news report. The company will launch its new electric vehicle in Norway next month. According to Dr. Smith, the production target is 50,000 units. The company invested 200 million dollars into the battery technology."

with open("synth.ps1", "w", encoding="utf-8") as f:
    f.write(f'''
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SetOutputToWaveFile("real_test.wav")
$s.Speak("{text}")
$s.Dispose()
''')

subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", "synth.ps1"], check=True)
subprocess.run(["ffmpeg", "-y", "-i", "real_test.wav", "-acodec", "libmp3lame", "-b:a", "128k", "real_test.mp3"], check=True, capture_output=True)

with open("real_test.mp3", "rb") as f:
    mp3_b64 = base64.b64encode(f.read()).decode("ascii")

print(f"Generated real_test.mp3, size: {os.path.getsize('real_test.mp3')} bytes")

stem = """Listen to the business news report and choose the best answers.
(1) (单选题) Where will the new electric vehicle be launched?
A Sweden
B Norway
C Finland
D Denmark

(2) (单选题) What is the production target according to Dr. Smith?
A 30,000 units
B 40,000 units
C 50,000 units
D 60,000 units

(3) (单选题) How much did the company invest into battery technology?
A 100 million dollars
B 150 million dollars
C 200 million dollars
D 250 million dollars

【复合小题约束：本大题页面共有 3 道选择/匹配小题。请务必在 values 数组中按小题顺序（第1题至第3题）依次输出全部 3 道小题的最终答案，严禁少填、漏填或合并！】"""

payload = {
    "stem": stem,
    "options": [],
    "type": "8",
    "audio": {
        "data": mp3_b64,
        "format": "mp3"
    }
}

import os

req = urllib.request.Request(
    os.getenv("PROXY_URL", "https://tiku.example.com/api/open/v1/search/exact"),
    data=json.dumps(payload).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "X-Consumer-Token": os.getenv("PROXY_TOKEN", "your-proxy-token")
    }
)

print("Sending 3-subquestion composite listening test to proxy server...")
with urllib.request.urlopen(req, timeout=90) as r:
    res = json.loads(r.read().decode())
    print("Status:", r.status)
    print("Full response:", json.dumps(res, ensure_ascii=False, indent=2))
    values = res["data"]["items"][0]["answer"]["values"]
    print("=" * 60)
    print("Model extracted answers for the 3 sub-questions:")
    for idx, v in enumerate(values, 1):
        print(f"  Sub-question ({idx}): {v}")
    print("=" * 60)
