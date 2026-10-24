Get-ChildItem -Path "C:\Users\SHAJUN\Downloads" -File | Where-Object { $_.Extension -match '\.(png|jpg|jpeg|webp)' } | Select-Object Name, Length | Format-Table -AutoSize
