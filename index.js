const { spawn } = require('child_process');
const { statSync, existsSync } = require('fs');
const { readdir, copyFile, unlink } = require('fs/promises');
const { exit } = require('process');
const { resolve, dirname, join } = require('path');

const FFMPEG_REGEX = /frame=([0-9]+)fps=((?:[0-9]+)|(?:[0-9]+\.[0-9]+))q=(-*[0-9]+\.[0-9]+)size=((?:[0-9]+[a-zA-Z]{2})|N\/A)time=(-*[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{2})bitrate=((?:-*[0-9]+\.[0-9]+)|N\/A).*speed=([0-9]+\.[0-9]+)x/;
const DIRECTORY = dirname(process.argv[0]);
const TEMP_FILE = join(DIRECTORY, 'temp.mp4');

if (process.argv.length == 2) {
    console.log("no args")
    exit(0);
}

async function main() {
    for(let i = 2; i < process.argv.length; i++){
        let currentArg = process.argv[i];
    
        if (!existsSync(currentArg)) {
            console.log(`"${currentArg}" - file/directory not found`);
            exit(0);
        }
    
        let isDir = statSync(input).isDirectory();
        if (isDir) {
            for await (let fileName of getFiles(input)) {
                await convertMedia(fileName);
            }
        } else {
            await convertMedia(input);
        }
    }
    
    console.log("all done");
    setTimeout(() => {}, 5000);
}

main();

async function convertMedia(fileName){
    return new Promise(async (res, rej) => {
        console.log(fileName);
        let code = await optimiseMedia(fileName);
        if (code != 0) {
            console.log("error :(");
            rej("error");
        }
        console.log("done!");
        await moveMedia(fileName);
        
        res();
    });
}

function optimiseMedia(path) {
    //stuff
    return new Promise((res) => {
        const execution = spawn(
            'ffmpeg',
            [
                '-y',
                '-i', path,
                '-map', '0',
                '-c:v', 'libx264',
                '-crf:v', '18',
                '-preset:v', 'slow',
                '-c:a', 'libopus',
                '-b:a', '128k',
                '-ac', '2',

                TEMP_FILE
            ],
            {
                stdio: [
                    'ignore',
                    'ignore',
                    'pipe'
                ]
            }
        );
        
        execution.stderr.on('data', data => {
            let stuff = FFMPEG_REGEX.exec(data.toString().replace(/\s/g, ''));
            if(stuff == null) return;
            process.stdout.write(`\rtime: ${stuff[5]} - fps: ${stuff[2]} - totalsize: ${stuff[4]} `);
        });

        execution.on('exit', code => {
            res(code);
        })
    });
}

async function moveMedia(path) {
    await copyFile(TEMP_FILE, path);
    await unlink(TEMP_FILE);
}

async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}