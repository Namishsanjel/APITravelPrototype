$ErrorActionPreference = 'Stop'
$files = @('src\data\pages.js', 'src\data\content.js')
New-Item -ItemType Directory -Force 'public\img' | Out-Null

$urls = @()
foreach ($f in $files) {
  $c = Get-Content $f -Raw
  $urls += [regex]::Matches($c, 'https://framerusercontent\.com/images/[A-Za-z0-9]+\.(?:jpg|png)\?[A-Za-z0-9=&_\-%.]+') | ForEach-Object { $_.Value }
}
$urls = @($urls | Sort-Object -Unique)
Write-Output "found $($urls.Count) urls"

$map = @{}
$failed = @()
foreach ($u in $urls) {
  $uri = [Uri]$u
  $id = [IO.Path]::GetFileNameWithoutExtension($uri.AbsolutePath)
  $ext = [IO.Path]::GetExtension($uri.AbsolutePath)
  $q = $uri.Query
  $md5 = [Security.Cryptography.MD5]::Create()
  $hash = -join ($md5.ComputeHash([Text.Encoding]::UTF8.GetBytes($q))[0..2] | ForEach-Object { $_.ToString('x2') })
  $name = "$id-$hash$ext"
  $out = Join-Path 'public\img' $name
  if ((Test-Path $out) -and (Get-Item $out).Length -gt 0) {
    $map[$u] = "/img/$name"
    continue
  }
  $ok = $false
  for ($i = 0; $i -lt 3 -and -not $ok; $i++) {
    try {
      Invoke-WebRequest $u -OutFile $out -UseBasicParsing -TimeoutSec 25
      $ok = $true
    } catch {
      $msg = $_.Exception.Message
      if ($msg -match '404') { Write-Output "404 $u"; break }
      Write-Output "retry ${i}: $name $msg"
      Start-Sleep 1
    }
  }
  if (-not $ok -or -not (Test-Path $out) -or (Get-Item $out).Length -eq 0) {
    if (Test-Path $out) { Remove-Item $out -Force }
    $failed += $u
    continue
  }
  Write-Output "OK $name $((Get-Item $out).Length)"
  $map[$u] = "/img/$name"
}

foreach ($f in $files) {
  $c = Get-Content $f -Raw
  foreach ($k in $map.Keys) { $c = $c.Replace($k, $map[$k]) }
  [IO.File]::WriteAllText((Resolve-Path $f), $c, [Text.UTF8Encoding]::new($false))
}
Write-Output "DONE $($map.Count)/$($urls.Count) failed=$($failed.Count)"
foreach ($f in $failed) { Write-Output "  FAILED $f" }
