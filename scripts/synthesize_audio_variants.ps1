# scripts/synthesize_audio_variants.ps1
# Synthesizes 2x (concise) and 5x (key-points) audio tracks for all 7 species * 12 stages = 168 tracks

Add-Type -AssemblyName System.Speech

$jsonPath = Join-Path $PSScriptRoot "narrations_variants_dump.json"
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

$synth.Volume = 100

# 22050 Hz 16-bit Mono
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

    Write-Host "`nSynthesizing variants for species: $speciesId..." -ForegroundColor Yellow

    foreach ($stage in $speciesData.stages) {
        $stageId = $stage.stageId
        
        # 1. Concise (2x) variant
        $outFile2x = Join-Path $speciesDir "${stageId}_2x.wav"
        $totalCount++
        try {
            $synth.Rate = 0  # Standard conversational pace
            $synth.SetOutputToWaveFile($outFile2x, $format)
            $synth.Speak($stage.script2x)
            $synth.SetOutputToNull()
            $successCount++
        }
        catch {
            Write-Error "Failed 2x: $speciesId / $stageId : $_"
        }

        # 2. Key-Points (5x) variant
        $outFile5x = Join-Path $speciesDir "${stageId}_5x.wav"
        $totalCount++
        try {
            $synth.Rate = 1  # Brisk, articulate pace
            $synth.SetOutputToWaveFile($outFile5x, $format)
            $synth.Speak($stage.script5x)
            $synth.SetOutputToNull()
            $successCount++
        }
        catch {
            Write-Error "Failed 5x: $speciesId / $stageId : $_"
        }
    }
}

$synth.Dispose()
$elapsed = [Math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "Speed Variant Synthesis Complete!" -ForegroundColor Cyan
Write-Host "Total Generated: $successCount / $totalCount files in $elapsed seconds" -ForegroundColor Cyan
Write-Host "Output Directory: $outputBase" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
