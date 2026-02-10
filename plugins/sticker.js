const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawn } = require('child_process')
const fetch = require('node-fetch')
const ffmpeg = require('fluent-ffmpeg')
const webp = require('node-webpmux')
const { fileTypeFromBuffer } = require('file-type')

const tmpDir = path.join(__dirname, '../tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

/* ================== الحقوق ================== */
const PACK_NAME = `صلـي على سيدنا ونبينا مـحمـد❤‍🩹

ㅤ .̸̳̔̎̎̎/̸̛̅̅͆̎͞ ̔̿̅ ̄̅̅ ̿ ̿ ̿ ̿ ̿   𝖣𝖠𝖱𝖪 𝖹𝖤𝖭𝖨𝖭 𝖡𝖮𝖳  ♚`
const AUTHOR = 'Dark Zenin'

/* ================== إضافة Exif ================== */
async function addExif(webpBuffer) {
  const img = new webp.Image()
  const json = {
    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
    'sticker-pack-name': PACK_NAME,
    'sticker-pack-publisher': AUTHOR,
    'emojis': ['❤‍🩹']
  }

  const exifAttr = Buffer.from([
    0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
    0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
    0x00,0x00,0x16,0x00,0x00,0x00
  ])

  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)

  await img.load(webpBuffer)
  img.exif = exif
  return await img.save(null)
}

/* ================== تحويل صورة → webp ================== */
async function imageToWebp(buffer) {
  return new Promise((resolve, reject) => {
    const input = path.join(tmpDir, `${Date.now()}.jpg`)
    const output = path.join(tmpDir, `${Date.now()}.webp`)

    fs.writeFileSync(input, buffer)

    ffmpeg(input)
      .outputOptions([
        '-vf',
        'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,' +
        'format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000'
      ])
      .toFormat('webp')
      .save(output)
      .on('end', () => {
        const data = fs.readFileSync(output)
        fs.unlinkSync(input)
        fs.unlinkSync(output)
        resolve(data)
      })
      .on('error', err => {
        reject(err)
      })
  })
}

/* ================== تحويل فيديو / GIF → webp ================== */
async function videoToWebp(buffer) {
  return new Promise((resolve, reject) => {
    const input = path.join(tmpDir, `${Date.now()}.mp4`)
    const output = path.join(tmpDir, `${Date.now()}.webp`)

    fs.writeFileSync(input, buffer)

    ffmpeg(input)
      .outputOptions([
        '-vcodec', 'libwebp',
        '-vf',
        'scale=512:512:force_original_aspect_ratio=decrease,' +
        'fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
        '-loop', '0',
        '-an'
      ])
      .save(output)
      .on('end', () => {
        const data = fs.readFileSync(output)
        fs.unlinkSync(input)
        fs.unlinkSync(output)
        resolve(data)
      })
      .on('error', err => {
        reject(err)
      })
  })
}

/* ================== الدالة الرئيسية ================== */
async function sticker(input, isUrl = false) {
  let buffer

  if (isUrl) {
    const res = await fetch(input)
    buffer = await res.buffer()
  } else {
    buffer = input
  }

  const type = await fileTypeFromBuffer(buffer)

  let webpBuffer
  if (/image/.test(type.mime)) {
    webpBuffer = await imageToWebp(buffer)
  } else if (/video/.test(type.mime)) {
    webpBuffer = await videoToWebp(buffer)
  } else {
    throw 'نوع غير مدعوم'
  }

  return await addExif(webpBuffer)
}

module.exports = {
  sticker
    }
