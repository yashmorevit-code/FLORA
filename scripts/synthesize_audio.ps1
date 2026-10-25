# scripts/synthesize_audio.ps1
# Synthesizes all 84 educational narration audio tracks using Windows local System.Speech TTS engine

Add-Type -AssemblyName System.Speech

$jsonPath = Join-Path $PSScriptRoot "narrations_dump.json"
if (-not (Test-Path $jsonPath)) {
    Write-Error "JSON dump not found at $jsonPath"
    exit 1
}

$rawJson = Get-Content $jsonPath -Raw | ConvertFrom-Json
$outputBase = Join-Path (Split-Path $PSScriptRoot -Parent) "public\assets\audio\narration"

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Select voice (prefer Zira Desktop for articulate educational narration, fallback to first available)
$installed = $synth.GetInstalledVoices() | Where-Object { $_.Enabled }
$voice = $installed | Where-Object { $_.VoiceInfo.Name -match "Zira" } | Select-Object -First 1
if (-not $voice) {
    $voice = $installed | Select-Object -First 1
}

if ($voice) {
    $synth.SelectVoice($voice.VoiceInfo.Name)
    Write-Host "Selected TTS Voice: $($voice.VoiceInfo.Name)" -ForegroundColor Cyan
}

# Configure speech rate (-1 for deliberate documentary pacing, 0 for default conversational)
$synth.Rate = -1
$synth.Volume = 100

# 22050 Hz 16-bit Mono provides high intelligibility and clean audio for browser playback
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
    22050,
    [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
    [System.Speech.AudioFormat.AudioChannel]::Mono
)

$totalCount = 0
$successCount = 0
$startTime = Get-Date

foreach ($speciesProp in $rawJson.PSObject.Properties) {
    $speciesId = $speciesProp.Name
    $speciesData = $speciesProp.Value
    $speciesDir = Join-Path $outputBase $speciesId

    if (-not (Test-Path $speciesDir)) {
        New-Item -ItemType Directory -Force -Path $speciesDir | Out-Null
    }

    Write-Host "`nProcessing species: $speciesId ($($speciesData.commonName))..." -ForegroundColor Yellow

    foreach ($stage in $speciesData.stages) {
        $stageId = $stage.stageId
        $script = $stage.script
        $outFile = Join-Path $speciesDir "$stageId.wav"

        $totalCount++

        try {
            $synth.SetOutputToWaveFile($outFile, $format)
            $synth.Speak($script)
            $synth.SetOutputToNull()

            $item = Get-Item $outFile
            $sizeKb = [Math]::Round($item.Length / 1KB, 1)
            Write-Host "  [$totalCount/84] Generated: $speciesId / $stageId.wav ($sizeKb KB)" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-Error "  Failed to generate $speciesId / $stageId.wav: $_"
        }
    }
}

$synth.Dispose()
$elapsed = [Math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "TTS Audio Synthesis Complete!" -ForegroundColor Cyan
Write-Host "Total Generated: $successCount / $totalCount files in $elapsed seconds" -ForegroundColor Cyan
Write-Host "Output Directory: $outputBase" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
