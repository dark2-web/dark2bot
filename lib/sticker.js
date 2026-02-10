const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const ffmpeg = require('fluent-ffmpeg')

async function sticker(img, url, packname, author) {
    return new Promise(async (resolve, reject) => {
        try {
            if (url) {
                let res = await fetch(url)
                if (res.status !== 200) throw await res.text()
                img = await res.buffer()
            }
            
            // تحويل احترافي باستخدام ffmpeg لضبط المقاسات 512x512
            const tmp = path.join(__dirname, '../tmp/' + Date.now() + '.webp')
            const inp = path.join(__dirname, '../tmp/' + Date.now() + '.png')
            await fs.promises.writeFile(inp, img)

            ffmpeg(inp)
                .input(inp)
                .on('error', reject)
                .on('end', () => {
                    const result = fs.readFileSync(tmp)
                    fs.unlinkSync(inp)
                    fs.unlinkSync(tmp)
                    resolve(result)
                })
                .addOutputOptions([
                    "-vcodec", "libwebp",
                    "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
                ])
                .toFormat('webp')
                .save(tmp)
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = { sticker }

