Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 1200
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.Clear([System.Drawing.Color]::Transparent)

$gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  ([System.Drawing.PointF]::new(260, 820)),
  ([System.Drawing.PointF]::new(940, 330)),
  ([System.Drawing.Color]::FromArgb(255, 36, 200, 212)),
  ([System.Drawing.Color]::FromArgb(255, 244, 197, 96))
)

$basePen = New-Object System.Drawing.Pen($gradient, 24)
$basePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$basePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$basePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

$bookPen = New-Object System.Drawing.Pen($gradient, 26)
$bookPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$bookPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$bookPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

$accentPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 98, 232, 184), 20)
$accentPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$accentPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$accentPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

function Draw-BookOutline {
  param(
    [System.Drawing.Graphics]$Canvas,
    [System.Drawing.Pen]$Pen,
    [float]$Left,
    [float]$Top,
    [float]$Width,
    [float]$Height,
    [float]$Tilt = 0
  )

  $state = $Canvas.Save()
  if ($Tilt -ne 0) {
    $canvas.TranslateTransform($Left + ($Width / 2), $Top + ($Height / 2))
    $canvas.RotateTransform($Tilt)
    $canvas.TranslateTransform(-($Left + ($Width / 2)), -($Top + ($Height / 2)))
  }

  $canvas.DrawRectangle($Pen, $Left, $Top, $Width, $Height)
  $canvas.Restore($state)
}

function Draw-Star {
  param(
    [System.Drawing.Graphics]$Canvas,
    [System.Drawing.Pen]$Pen,
    [float]$CenterX,
    [float]$CenterY,
    [float]$OuterSize,
    [float]$InnerSize
  )

  $points = [System.Drawing.PointF[]]@(
    ([System.Drawing.PointF]::new($CenterX, $CenterY - $OuterSize)),
    ([System.Drawing.PointF]::new($CenterX + $InnerSize, $CenterY - $InnerSize)),
    ([System.Drawing.PointF]::new($CenterX + $OuterSize, $CenterY)),
    ([System.Drawing.PointF]::new($CenterX + $InnerSize, $CenterY + $InnerSize)),
    ([System.Drawing.PointF]::new($CenterX, $CenterY + $OuterSize)),
    ([System.Drawing.PointF]::new($CenterX - $InnerSize, $CenterY + $InnerSize)),
    ([System.Drawing.PointF]::new($CenterX - $OuterSize, $CenterY)),
    ([System.Drawing.PointF]::new($CenterX - $InnerSize, $CenterY - $InnerSize)),
    ([System.Drawing.PointF]::new($CenterX, $CenterY - $OuterSize))
  )

  $canvas.DrawLines($Pen, $points)
}

$graphics.DrawLine($basePen, 270, 815, 930, 815)

Draw-BookOutline -Canvas $graphics -Pen $bookPen -Left 390 -Top 510 -Width 100 -Height 305
$graphics.DrawLine($bookPen, 550, 455, 550, 815)
$graphics.DrawLine($bookPen, 680, 455, 680, 815)
Draw-BookOutline -Canvas $graphics -Pen $bookPen -Left 740 -Top 500 -Width 110 -Height 325 -Tilt -11

Draw-Star -Canvas $graphics -Pen $basePen -CenterX 610 -CenterY 360 -OuterSize 78 -InnerSize 28
Draw-Star -Canvas $graphics -Pen $accentPen -CenterX 605 -CenterY 515 -OuterSize 32 -InnerSize 12

$output = 'C:\Users\gambe\OneDrive\Desktop\NovaLibra\frontend\public\logo-v2.png'
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

$accentPen.Dispose()
$bookPen.Dispose()
$basePen.Dispose()
$gradient.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
