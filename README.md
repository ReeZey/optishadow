# optishadow
optimizes media to reduce filesize while preserving most of the visual quality  

* requires ffmpeg i path or same folder*  
* supports everything ffmpeg supports  
* this will replace the old file with the new

all the program does is recursively walk the path of the directory or single file its presented with at launch  
and runs `ffmpeg -map 0 -c:v libx264 -crf:v 18 -preset:v slow -c:a libopus -b:a 128k -ac 2`  
and then replaces the old file with the new one

during convertion it stores the video in same directory as `optishadow.exe` and after convertion it copies the file to its real destination and replacing original file

example: `optishadow.exe "input.mp4"`  
will convert the video to a more optimized media

its also possible to drag&drop a media file or directory ontop of the `optishadow.exe`