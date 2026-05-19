# Calendar app icons: ring-bound + 3x3 grid.
# Foreground is scaled to fit Android adaptive "safe zone" (~66dp circle in 108dp) so masks don't crop the shape.
param(
    [string]$AssetsDir = (Join-Path (Split-Path -Parent $PSScriptRoot) "assets")
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = 2 * $r
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

function Save-SquareIcon([int]$sz, [string]$pathOut) {
    $bmp = New-Object System.Drawing.Bitmap($sz, $sz)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $w = [float]$sz
    $cx = $w / 2.0

    # Fit entire calendar (diagonal) inside ~60% of canvas = inside adaptive icon safe circle (66/108).
    $maxDiag = $sz * 0.60
    $rw = [math]::Floor($sz * 0.44)
    $rh = [math]::Floor($sz * 0.405)
    $diag = [math]::Sqrt($rw * $rw + $rh * $rh)
    if ($diag -gt $maxDiag) {
        $s = $maxDiag / $diag
        $rw = [math]::Floor($rw * $s)
        $rh = [math]::Floor($rh * $s)
    }

    $rx = [math]::Floor(($sz - $rw) / 2.0)
    $ry = [math]::Floor(($sz - $rh) / 2.0) - [math]::Floor($sz * 0.02)

    $g.Clear([System.Drawing.Color]::FromArgb(255, 255, 255))

    $col = [System.Drawing.Color]::FromArgb(255, 30, 36, 45)
    $thick = [math]::Max(4.5, ([math]::Min($rw, $rh)) * 0.042)
    $pen = New-Object System.Drawing.Pen($col, $thick)
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $brush = New-Object System.Drawing.SolidBrush($col)

    $rc = [math]::Max(18.0, ([math]::Min($rw, $rh)) * 0.11)
    $outer = New-RoundedRectPath ([float]$rx) ([float]$ry) ([float]$rw) ([float]$rh) $rc
    $g.DrawPath($pen, $outer)

    $bandH = [math]::Floor($rh * 0.22)
    $divY = $ry + $bandH + [math]::Floor($thick / 3)
    $insetInner = [math]::Max($thick + 6, $rw * 0.065)
    $g.DrawLine($pen, ($rx + $insetInner), $divY, ($rx + $rw - $insetInner), $divY)

    $ringR = [math]::Max(3.8, $rw * 0.038)
    $ringY = $ry + [math]::Floor($bandH * 0.48)
    $spread = $rw * 0.62
    $x0 = $cx - ($spread / 2.0)
    for ($i = 0; $i -lt 5; $i++) {
        $rx_ring = [math]::Round($x0 + ($i / 4.0) * $spread - $ringR)
        $ry_ring = [math]::Round($ringY - $ringR)
        $dia = [math]::Round($ringR * 2)
        $g.FillEllipse($brush, $rx_ring, $ry_ring, $dia, $dia)
    }

    $gridTop = $divY + [math]::Floor($rh * 0.085)
    $gridBottom = $ry + $rh - [math]::Floor($rh * 0.095)
    $availH = $gridBottom - $gridTop
    $cell = [math]::Max(10, [math]::Floor($availH / 5.2))
    $gap = [math]::Max(4, [math]::Floor($cell * 0.45))
    $blockH = 3 * $cell + 2 * $gap
    $blockW = 3 * $cell + 2 * $gap
    $gx0 = $cx - ($blockW / 2)
    $gy = $gridTop + [math]::Floor(($availH - $blockH) / 2)

    for ($ci = 0; $ci -lt 3; $ci++) {
        for ($rj = 0; $rj -lt 3; $rj++) {
            $xb = [math]::Round($gx0 + $ci * ($cell + $gap))
            $yb = [math]::Round($gy + $rj * ($cell + $gap))
            $side = [math]::Max(1, $cell - [math]::Max(2, [math]::Floor($thick * 0.85)))
            [void]$g.FillRectangle($brush, $xb, $yb, $side, $side)
        }
    }

    $bmp.Save($pathOut, [System.Drawing.Imaging.ImageFormat]::Png)
    $pen.Dispose(); $brush.Dispose(); $outer.Dispose(); $g.Dispose(); $bmp.Dispose()
}

if (-not (Test-Path $AssetsDir)) {
    New-Item -ItemType Directory -Path $AssetsDir | Out-Null
}

Save-SquareIcon 1024 (Join-Path $AssetsDir "icon.png")
Save-SquareIcon 1024 (Join-Path $AssetsDir "adaptive-icon.png")
Save-SquareIcon 1024 (Join-Path $AssetsDir "splash-icon.png")

$favBmp = New-Object System.Drawing.Bitmap(64, 64)
$gf = [System.Drawing.Graphics]::FromImage($favBmp)
$gf.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$ico = [System.Drawing.Image]::FromFile((Join-Path $AssetsDir "icon.png"))
$gf.DrawImage($ico, 0, 0, 64, 64)
$favBmp.Save((Join-Path $AssetsDir "favicon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$gf.Dispose(); $ico.Dispose(); $favBmp.Dispose()

Write-Host "Wrote PNGs under $AssetsDir (safe-zone scaled for adaptive icons)"
