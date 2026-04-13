Add-Type -AssemblyName System.Drawing

$width = 1600
$height = 1100
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$background = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  ([System.Drawing.PointF]::new(0, 0)),
  ([System.Drawing.PointF]::new($width, $height)),
  ([System.Drawing.Color]::FromArgb(255, 11, 9, 32)),
  ([System.Drawing.Color]::FromArgb(255, 6, 8, 22))
)
$graphics.FillRectangle($bgBrush, $background)

function Fill-EllipseGlow {
  param(
    [System.Drawing.Graphics]$Canvas,
    [int]$X,
    [int]$Y,
    [int]$W,
    [int]$H,
    [System.Drawing.Color]$Color
  )

  $brush = New-Object System.Drawing.SolidBrush($Color)
  $Canvas.FillEllipse($brush, $X, $Y, $W, $H)
  $brush.Dispose()
}

function Draw-RoundedRect {
  param(
    [System.Drawing.Graphics]$Canvas,
    [System.Drawing.Pen]$Pen,
    [System.Drawing.Brush]$Brush,
    [float]$X,
    [float]$Y,
    [float]$W,
    [float]$H,
    [float]$R
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $R * 2
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
  $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
  $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
  $path.CloseFigure()

  if ($Brush) {
    $Canvas.FillPath($Brush, $path)
  }
  if ($Pen) {
    $Canvas.DrawPath($Pen, $path)
  }
  $path.Dispose()
}

function Draw-BookSpine {
  param(
    [System.Drawing.Graphics]$Canvas,
    [float]$X,
    [float]$Y,
    [float]$W,
    [float]$H,
    [System.Drawing.Color]$Start,
    [System.Drawing.Color]$End,
    [float]$Angle = 0
  )

  $state = $Canvas.Save()
  $Canvas.TranslateTransform($X + ($W / 2), $Y + ($H / 2))
  if ($Angle -ne 0) {
    $Canvas.RotateTransform($Angle)
  }
  $Canvas.TranslateTransform(-($X + ($W / 2)), -($Y + ($H / 2)))

  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    ([System.Drawing.PointF]::new($X, $Y)),
    ([System.Drawing.PointF]::new($X + $W, $Y + $H)),
    $Start,
    $End
  )
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 255, 226, 180), 2)
  Draw-RoundedRect -Canvas $Canvas -Pen $pen -Brush $brush -X $X -Y $Y -W $W -H $H -R 12

  $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 255, 217, 153), 2)
  $Canvas.DrawLine($linePen, $X + 12, $Y + 36, $X + $W - 12, $Y + 36)
  $Canvas.DrawLine($linePen, $X + 12, $Y + $H - 36, $X + $W - 12, $Y + $H - 36)

  $linePen.Dispose()
  $pen.Dispose()
  $brush.Dispose()
  $Canvas.Restore($state)
}

function Draw-Star {
  param(
    [System.Drawing.Graphics]$Canvas,
    [float]$CX,
    [float]$CY,
    [float]$Outer,
    [float]$Inner,
    [System.Drawing.Color]$Color,
    [float]$Width = 6
  )

  $pen = New-Object System.Drawing.Pen($Color, $Width)
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $points = [System.Drawing.PointF[]]@(
    ([System.Drawing.PointF]::new($CX, $CY - $Outer)),
    ([System.Drawing.PointF]::new($CX + $Inner, $CY - $Inner)),
    ([System.Drawing.PointF]::new($CX + $Outer, $CY)),
    ([System.Drawing.PointF]::new($CX + $Inner, $CY + $Inner)),
    ([System.Drawing.PointF]::new($CX, $CY + $Outer)),
    ([System.Drawing.PointF]::new($CX - $Inner, $CY + $Inner)),
    ([System.Drawing.PointF]::new($CX - $Outer, $CY)),
    ([System.Drawing.PointF]::new($CX - $Inner, $CY - $Inner)),
    ([System.Drawing.PointF]::new($CX, $CY - $Outer))
  )
  $Canvas.DrawLines($pen, $points)
  $pen.Dispose()
}

Fill-EllipseGlow -Canvas $graphics -X 860 -Y 70 -W 420 -H 360 -Color ([System.Drawing.Color]::FromArgb(42, 124, 69, 255))
Fill-EllipseGlow -Canvas $graphics -X 980 -Y 360 -W 300 -H 220 -Color ([System.Drawing.Color]::FromArgb(26, 242, 186, 86))
Fill-EllipseGlow -Canvas $graphics -X 1120 -Y 110 -W 260 -H 220 -Color ([System.Drawing.Color]::FromArgb(28, 232, 95, 201))

$tableBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  ([System.Drawing.PointF]::new(0, 740)),
  ([System.Drawing.PointF]::new(0, $height)),
  ([System.Drawing.Color]::FromArgb(255, 33, 18, 30)),
  ([System.Drawing.Color]::FromArgb(255, 9, 10, 18))
)
$graphics.FillRectangle($tableBrush, 0, 760, $width, 340)

$mistPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(76, 165, 114, 255), 9)
$mistPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$mistPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$mistPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$mistPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$mistPath.AddBezier(760, 470, 705, 420, 740, 362, 720, 315)
$mistPath.AddBezier(720, 315, 700, 270, 754, 252, 734, 210)
$mistPath.AddBezier(734, 210, 712, 176, 738, 150, 726, 116)
$graphics.DrawPath($mistPen, $mistPath)

$cupShadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 0, 0, 0))
$graphics.FillEllipse($cupShadow, 585, 620, 260, 75)
$cupShadow.Dispose()

$cupBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  ([System.Drawing.PointF]::new(565, 420)),
  ([System.Drawing.PointF]::new(845, 710)),
  ([System.Drawing.Color]::FromArgb(255, 34, 28, 56)),
  ([System.Drawing.Color]::FromArgb(255, 8, 10, 20))
)
$cupPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 212, 174, 98), 3)
Draw-RoundedRect -Canvas $graphics -Pen $cupPen -Brush $cupBrush -X 600 -Y 455 -W 220 -H 230 -R 26
$graphics.DrawEllipse($cupPen, 790, 505, 72, 110)
$graphics.DrawEllipse($cupPen, 615, 442, 190, 38)

$logoPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 214, 174, 98), 5)
$logoPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawLine($logoPen, 670, 560, 670, 610)
$graphics.DrawLine($logoPen, 706, 560, 706, 610)
$graphics.DrawRectangle($logoPen, 636, 560, 30, 48)
$graphics.DrawRectangle($logoPen, 710, 560, 30, 48)
Draw-Star -Canvas $graphics -CX 688 -CY 534 -Outer 20 -Inner 7 -Color ([System.Drawing.Color]::FromArgb(180, 214, 174, 98)) -Width 4

$fontTitle = New-Object System.Drawing.Font('Times New Roman', 28, [System.Drawing.FontStyle]::Regular)
$fontBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(135, 214, 174, 98))
$graphics.DrawString('NOVALIBRA', $fontTitle, $fontBrush, 620, 626)

$openBookFill = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  ([System.Drawing.PointF]::new(860, 600)),
  ([System.Drawing.PointF]::new(1230, 860)),
  ([System.Drawing.Color]::FromArgb(255, 229, 220, 204)),
  ([System.Drawing.Color]::FromArgb(255, 135, 113, 150))
)
$openBookPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 255, 230, 205), 2)
$leftPoints = [System.Drawing.Point[]]@(
  ([System.Drawing.Point]::new(860, 775)),
  ([System.Drawing.Point]::new(920, 610)),
  ([System.Drawing.Point]::new(1055, 585)),
  ([System.Drawing.Point]::new(1010, 790))
)
$rightPoints = [System.Drawing.Point[]]@(
  ([System.Drawing.Point]::new(1010, 790)),
  ([System.Drawing.Point]::new(1055, 585)),
  ([System.Drawing.Point]::new(1210, 620)),
  ([System.Drawing.Point]::new(1260, 815))
)
$graphics.FillPolygon($openBookFill, $leftPoints)
$graphics.FillPolygon($openBookFill, $rightPoints)
$graphics.DrawPolygon($openBookPen, $leftPoints)
$graphics.DrawPolygon($openBookPen, $rightPoints)

$pagePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 90, 54, 44), 1)
for ($i = 0; $i -lt 11; $i++) {
  $y = 635 + ($i * 13)
  $graphics.DrawLine($pagePen, 935, $y, 1030, $y + 14)
  $graphics.DrawLine($pagePen, 1070, $y + 8, 1195, $y + 24)
}

Draw-BookSpine -Canvas $graphics -X 1295 -Y 420 -W 92 -H 345 -Start ([System.Drawing.Color]::FromArgb(255, 26, 27, 72)) -End ([System.Drawing.Color]::FromArgb(255, 13, 11, 33)) -Angle 11
Draw-BookSpine -Canvas $graphics -X 1382 -Y 440 -W 84 -H 325 -Start ([System.Drawing.Color]::FromArgb(255, 40, 31, 86)) -End ([System.Drawing.Color]::FromArgb(255, 14, 11, 34)) -Angle 8
Draw-BookSpine -Canvas $graphics -X 1215 -Y 470 -W 86 -H 290 -Start ([System.Drawing.Color]::FromArgb(255, 53, 34, 74)) -End ([System.Drawing.Color]::FromArgb(255, 18, 13, 30)) -Angle 14

for ($i = 0; $i -lt 18; $i++) {
  $size = Get-Random -Minimum 6 -Maximum 18
  $x = Get-Random -Minimum 930 -Maximum 1280
  $y = Get-Random -Minimum 120 -Maximum 460
  $alpha = Get-Random -Minimum 80 -Maximum 170
  $color = if ($i % 3 -eq 0) {
    [System.Drawing.Color]::FromArgb($alpha, 255, 214, 128)
  } elseif ($i % 3 -eq 1) {
    [System.Drawing.Color]::FromArgb($alpha, 194, 130, 255)
  } else {
    [System.Drawing.Color]::FromArgb($alpha, 117, 225, 255)
  }

  Fill-EllipseGlow -Canvas $graphics -X $x -Y $y -W $size -H $size -Color $color
}

Draw-Star -Canvas $graphics -CX 1040 -CY 205 -Outer 14 -Inner 5 -Color ([System.Drawing.Color]::FromArgb(195, 255, 219, 145)) -Width 4
Draw-Star -Canvas $graphics -CX 1146 -CY 250 -Outer 10 -Inner 4 -Color ([System.Drawing.Color]::FromArgb(190, 204, 148, 255)) -Width 3
Draw-Star -Canvas $graphics -CX 985 -CY 318 -Outer 12 -Inner 4 -Color ([System.Drawing.Color]::FromArgb(180, 255, 199, 111)) -Width 3

$overlay = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 255, 255, 255))
$graphics.FillRectangle($overlay, 0, 0, $width, 120)
$overlay.Dispose()

$output = 'C:\Users\gambe\OneDrive\Desktop\NovaLibra\frontend\public\hero-artwork-v1.png'
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

$pagePen.Dispose()
$openBookPen.Dispose()
$openBookFill.Dispose()
$fontBrush.Dispose()
$fontTitle.Dispose()
$logoPen.Dispose()
$cupPen.Dispose()
$cupBrush.Dispose()
$mistPath.Dispose()
$mistPen.Dispose()
$tableBrush.Dispose()
$bgBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
