param(
  [Parameter(Position = 0)]
  [string]$Setup,
  [string]$Dest = ".agents/skills",
  [string]$Agent = "universal",
  [string]$Repo = "marcioaltoe/skills",
  [string]$Ref = "main",
  [switch]$List,
  [switch]$DryRun,
  [switch]$Help
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
  Write-Error $Message
  exit 1
}

function Show-Usage {
  @"
Usage:
  install.ps1 <setup> [options]
  install.ps1 -List

Options:
  -List             List available setups
  -Agent <name>     Target agent for the skills CLI (default: universal)
  -Dest <path>      Legacy option; only .agents/skills is supported
  -Repo <owner/repo>
                    Source repository (default: marcioaltoe/skills)
  -Ref <ref>        Branch, tag, or commit to download (default: main)
  -DryRun           Print what would be installed
  -Help             Show this help

Examples:
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/marcioaltoe/skills/main/install.ps1))) fullstack"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/marcioaltoe/skills/main/install.ps1))) -List"
  .\install.ps1 frontend -Agent universal
"@
}

if ($Help) {
  Show-Usage
  exit 0
}

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$useLocal = (Test-Path (Join-Path $scriptDir "skills")) -and (Test-Path (Join-Path $scriptDir "setups"))
$rawBase = "https://raw.githubusercontent.com/$Repo/$Ref"

function Get-SetupText($Name) {
  $localPath = Join-Path (Join-Path $scriptDir "setups") $Name
  if ($useLocal -and (Test-Path $localPath)) {
    return Get-Content -Raw -LiteralPath $localPath
  }
  return (Invoke-RestMethod -Uri "$rawBase/setups/$Name")
}

if ($List) {
  $index = Get-SetupText "_index.txt"
  foreach ($line in ($index -split "`r?`n")) {
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
      continue
    }
    $parts = $line -split "\|", 2
    if ($parts.Count -eq 2) {
      "{0,-18} {1}" -f $parts[0], $parts[1]
    }
  }
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Setup)) {
  Show-Usage
  exit 1
}

$destPath = if ([System.IO.Path]::IsPathRooted($Dest)) {
  [System.IO.Path]::GetFullPath($Dest)
} else {
  [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $Dest))
}
$defaultDest = [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path ".agents/skills"))
if ($destPath -ne $defaultDest) {
  Fail "-Dest is not supported by the skills CLI; use -Agent instead"
}

function Get-SkillsCommand {
  if (Get-Command bunx -ErrorAction SilentlyContinue) {
    return @("bunx", "skills")
  }
  if (Get-Command npx -ErrorAction SilentlyContinue) {
    return @("npx", "--yes", "skills")
  }
  Fail "bunx or npx is required to run the skills CLI"
}

$setupText = Get-SetupText "$Setup.txt"
$skillsSource = if ($useLocal) { $scriptDir } else { "https://github.com/$Repo/tree/$Ref" }
$skillNames = [System.Collections.Generic.List[string]]::new()

foreach ($rawLine in ($setupText -split "`r?`n")) {
  $line = $rawLine.Trim()
  if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
    continue
  }
  $segments = $line -split "/"
  if ($line.StartsWith("/") -or $segments -contains "" -or $segments -contains "." -or $segments -contains "..") {
    Fail "unsafe skill path in $Setup.txt`: $line"
  }

  if ($useLocal) {
    $relativePath = [System.IO.Path]::Combine($segments)
    $sourceDir = Join-Path $scriptDir $relativePath
    if (-not (Test-Path -LiteralPath $sourceDir -PathType Container)) {
      Fail "skill path not found: $line"
    }
  }

  $skillName = Split-Path -Leaf $line
  if (-not $skillNames.Contains($skillName)) {
    [void]$skillNames.Add($skillName)
  }
}

$installed = $skillNames.Count
if ($installed -eq 0) {
  Fail "setup contains no skills: $Setup"
}

if ($DryRun) {
  foreach ($skillName in $skillNames) {
    "would install {0,-32} from {1}" -f $skillName, $skillsSource
  }
  Write-Host "Dry run complete: $installed skill(s) in setup '$Setup'"
  exit 0
}

$skillsCommand = Get-SkillsCommand
$exe = $skillsCommand[0]
$baseArgs = @()
if ($skillsCommand.Count -gt 1) {
  $baseArgs = $skillsCommand[1..($skillsCommand.Count - 1)]
}

$argsList = @("add", $skillsSource, "--agent", $Agent, "--copy", "-y")
foreach ($skillName in $skillNames) {
  $argsList += @("--skill", $skillName)
}

Write-Host "Installing $installed skill(s) from setup '$Setup' with the skills CLI"
& $exe @baseArgs @argsList
if ($LASTEXITCODE -ne 0) {
  Fail "skills CLI failed with exit code $LASTEXITCODE"
}
Write-Host "Installed $installed skill(s) from setup '$Setup'; skills-lock.json is managed by the skills CLI"
