 cd /d "G:\Мой диск\Сайтт"
del /Q *.html
del /Q *.js
del /Q *.css
gdown --folder https://drive.google.com/drive/folders/1olWJZN4-jsQy12hqQ9GIGpuuIcnTPk6R
git add .
git commit -m "Автообновление %date% %time%"
git push origin main
