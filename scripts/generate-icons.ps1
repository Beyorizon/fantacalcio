$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

function New-IconPng([int]$w, [int]$h, [string]$path) {
  $dir = Split-Path -Parent $path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $gfx.Clear([System.Drawing.Color]::FromArgb(11,15,25))

  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,255,255))
  $fontSize = [float]([Math]::Min($w,$h) * 0.45)
  $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $gfx.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
  $rect = New-Object System.Drawing.RectangleF(0,0,$w,$h)
  $gfx.DrawString('F', $font, $brush, $rect, $format)

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose(); $bmp.Dispose(); $brush.Dispose(); $font.Dispose();
}

New-IconPng 192 192 'public/icons/pwa-192.png'
New-IconPng 512 512 'public/icons/pwa-512.png'
New-IconPng 192 192 'public/icons/pwa-maskable-192.png'
New-IconPng 512 512 'public/icons/pwa-maskable-512.png'
New-IconPng 180 180 'public/icons/apple-touch-icon.png'

Write-Host 'Icons generated in public/icons'


