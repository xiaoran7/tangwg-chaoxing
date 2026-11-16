
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SetOutputToWaveFile("real_test.wav")
$s.Speak("Here is the business news report. The company will launch its new electric vehicle in Norway next month. According to Dr. Smith, the production target is 50,000 units. The company invested 200 million dollars into the battery technology.")
$s.Dispose()
