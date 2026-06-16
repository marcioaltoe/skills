param(
  [Parameter(Position = 0)]
  [string]$Setup,
  [string]$Dest = ".agents/skills",
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
  -Dest <path>      Install directory (default: .agents/skills)
  -Repo <owner/repo>
                    Source repository (default: marcioaltoe/skills)
  -Ref <ref>        Branch, tag, or commit to download (default: main)
  -DryRun           Print what would be installed
  -Help             Show this help

Examples:
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/marcioaltoe/skills/main/install.ps1))) fullstack"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/marcioaltoe/skills/main/install.ps1))) -List"
  .\install.ps1 frontend -Dest .agents\skills
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

$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("skills-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

try {
  if ($useLocal) {
    $repoRoot = $scriptDir
  } else {
    $zipPath = Join-Path $tempDir "repo.zip"
    $extractDir = Join-Path $tempDir "repo"
    New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
    Write-Host "Downloading $Repo@$Ref"
    Invoke-WebRequest -Uri "https://github.com/$Repo/archive/$Ref.zip" -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
    $repoRoot = (Get-ChildItem -LiteralPath $extractDir -Directory | Select-Object -First 1).FullName
    if ([string]::IsNullOrWhiteSpace($repoRoot)) {
      Fail "failed to extract repository archive"
    }
  }

  $setupText = Get-SetupText "$Setup.txt"
  $destPath = if ([System.IO.Path]::IsPathRooted($Dest)) {
    [System.IO.Path]::GetFullPath($Dest)
  } else {
    [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $Dest))
  }

  $installed = 0
  foreach ($rawLine in ($setupText -split "`r?`n")) {
    $line = $rawLine.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
      continue
    }
    $segments = $line -split "/"
    if ($line.StartsWith("/") -or $segments -contains "" -or $segments -contains "." -or $segments -contains "..") {
      Fail "unsafe skill path in $Setup.txt`: $line"
    }

    $relativePath = [System.IO.Path]::Combine($segments)
    $sourceDir = Join-Path $repoRoot $relativePath
    if (-not (Test-Path -LiteralPath $sourceDir -PathType Container)) {
      Fail "skill path not found: $line"
    }

    $skillName = Split-Path -Leaf $line
    $targetDir = Join-Path $destPath $skillName
    if ($DryRun) {
      "would install {0,-32} -> {1}" -f $skillName, $targetDir
    } else {
      New-Item -ItemType Directory -Force -Path $destPath | Out-Null
      if (Test-Path -LiteralPath $targetDir) {
        Remove-Item -LiteralPath $targetDir -Recurse -Force
      }
      Copy-Item -LiteralPath $sourceDir -Destination $targetDir -Recurse -Force
      "installed {0,-32} -> {1}" -f $skillName, $targetDir
    }
    $installed++
  }

  if ($DryRun) {
    Write-Host "Dry run complete: $installed skill(s) in setup '$Setup'"
  } else {
    Write-Host "Installed $installed skill(s) from setup '$Setup' into $destPath"
  }
} finally {
  if (Test-Path -LiteralPath $tempDir) {
    Remove-Item -LiteralPath $tempDir -Recurse -Force
  }
}
