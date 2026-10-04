$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force 'public\framer' | Out-Null
$mapFile = 'public\framer\map.json'
$map = @{}
if (Test-Path $mapFile) {
  $obj = Get-Content $mapFile -Raw | ConvertFrom-Json
  $obj.PSObject.Properties | ForEach-Object { $map[$_.Name] = $_.Value }
}

$fail = 0
Get-Content 'framerurls.txt' | ForEach-Object {
  $u = $_.Trim()
  if (-not $u) { return }
  if ($map.Contains($u)) { return }
  $uri = [Uri]$u
  $rel = ($uri.Host + $uri.AbsolutePath) -replace '[^A-Za-z0-9._-]', '_'
  if ($uri.Query) {
    $md5 = [Security.Cryptography.MD5]::Create()
    $qh = -join ($md5.ComputeHash([Text.Encoding]::UTF8.GetBytes($uri.Query))[0..2] | ForEach-Object { $_.ToString('x2') })
    $rel = $rel + '-' + $qh
  }
  $out = Join-Path 'public\framer' $rel
  if (-not (Test-Path $out) -or (Get-Item $out).Length -eq 0) {
    $ok = $false
    for ($i = 0; $i -lt 3 -and -not $ok; $i++) {
      try { Invoke-WebRequest $u -OutFile $out -UseBasicParsing -TimeoutSec 30; $ok = $true }
      catch {
        $msg = $_.Exception.Message
        if ($msg -match '404|403') { break }
        Start-Sleep 1
      }
    }
    if (-not $ok) { Write-Output "FAIL $u"; if (Test-Path $out) { Remove-Item $out -Force }; $script:fail++; return }
  }
  Write-Output "OK $rel $((Get-Item $out).Length)"
  $map[$u] = '/framer/' + $rel
}

$json = $map | ConvertTo-Json -Depth 3
[IO.File]::WriteAllText((Join-Path (Get-Location) $mapFile), $json)
Write-Output "map size: $($map.Count), failed: $fail"
