import { sticker } from './sticker.js'
import { uploadFile } from './uploadFile.js'
import { uploadImage } from './uploadImage.js'
// تم إزالة الاستيراد الغريب لـ WebP Moroccan
let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (/webp|image|video/g.test(mime)) {
      let img = await q.download?.()
      if (!img) throw `*عذراً، قم بالرد على (صورة) أو (فيديو) بـ ${usedPrefix + command}*`
      try {
        stiker = await sticker(img, false, global.packname, global.author)
      } catch (e) {
        console.error(e)
      } finally {
        if (!stiker) {
          let out
          if (/webp/g.test(mime)) out = img
          else if (/image/g.test(mime)) out = await uploadImage(img)
          else if (/video/g.test(mime)) out = await uploadFile(img)
          if (typeof out !== 'string') out = await uploadImage(img)
          stiker = await sticker(false, out, global.packname, global.author)
        }
      }
    } else if (args[0]) {
      if (isUrl(args[0])) stiker = await sticker(false, args[0], global.packname, global.author)
      else throw '*الرابط الذي أرسلته غير صالح!*'
    }
  } catch (e) {
    console.error(e)
    if (!stiker) stiker = e
  } finally {
    if (stiker) {
      if (Buffer.isBuffer(stiker)) {
        conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      } else {
        conn.reply(m.chat, String(stiker), m)
      }
    } else {
      conn.reply(m.chat, '*خطأ: تأكد من إرسال صورة أو فيديو قصير ثم الرد عليه بكلمة .ملصق*', m)
    }
  }
}

handler.help = ['ملصق', 'sticker']
handler.tags = ['sticker']
handler.command = ['ملصق', 'stiker', 'sticker', 'سوي_��لصق']

export default handler

const isUrl = (text) => {
  return /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i.test(text)
}import { sticker } from './sticker.js'
import { uploadFile } from './uploadFile.js'
import { uploadImage } from './uploadImage.js'
إزال الاستيراد الغريب لـ WebP Moroccan

// بقية الكود بدون تغيير ...
// تم إزالة الاستيراد الغريب لـ WebP Moroccan

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (/webp|image|video/g.test(mime)) {
      let img = await q.download?.()
      if (!img) throw `*عذراً، قم بالرد على (صورة) أو (فيديو) بـ ${usedPrefix + command}*`
      try {
        stiker = await sticker(img, false, global.packname, global.author)
      } catch (e) {
        console.error(e)
      } finally {
        if (!stiker) {
          let out
          if (/webp/g.test(mime)) out = img
          else if (/image/g.test(mime)) out = await uploadImage(img)
          else if (/video/g.test(mime)) out = await uploadFile(img)
          if (typeof out !== 'string') out = await uploadImage(img)
          stiker = await sticker(false, out, global.packname, global.author)
        }
      }
    } else if (args[0]) {
      if (isUrl(args[0])) stiker = await sticker(false, args[0], global.packname, global.author)
      else throw '*الرابط الذي أرسلته غير صالح!*'
    }
  } catch (e) {
    console.error(e)
    if (!stiker) stiker = e
  } finally {
    if (stiker) {
      if (Buffer.isBuffer(stiker)) {
        conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      } else {
        conn.reply(m.chat, String(stiker), m)
      }
    } else {
      conn.reply(m.chat, '*خطأ: تأكد من إرسال صورة أو فيديو قصير ثم الرد عليه بكلمة .ملصق*', m)
    }
  }
}

handler.help = ['ملصق', 'sticker']
handler.tags = ['sticker']
handler.command = ['ملصق', 'stiker', 'sticker', 'سوي_ملصق']

export default handler

const isUrl = (text) => {
  return /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i.test(text)
  }
