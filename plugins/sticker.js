import { sticker } from '../lib/sticker.js'
import { uploadFile } from '../lib/uploadFile.js'
import { uploadImage } from '../lib/uploadImage.js'
import { WebP Moroccan } from 'wa-sticker-formatter' // لو النظام عندك يدعمها

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    // التحقق إذا كان المرفق صورة أو فيديو
    if (/webp|image|video/g.test(mime)) {
      let img = await q.download?.()
      if (!img) throw `*عذراً، قم بالرد على (صورة) أو (فيديو) بـ ${usedPrefix + command}*`
      
      let out
      try {
        stiker = await sticker(img, false, global.packname, global.author)
      } catch (e) {
        console.error(e)
      } finally {
        if (!stiker) {
          if (/webp/g.test(mime)) out = img
          else if (/image/g.test(mime)) out = await uploadImage(img)
          else if (/video/g.test(mime)) out = await uploadFile(img)
          if (typeof out !== 'string') out = await uploadImage(img)
          stiker = await sticker(false, out, global.packname, global.author)
        }
      }
    } else if (args[0]) {
      // إذا أرسل رابط صورة مباشرة
      if (isUrl(args[0])) stiker = await sticker(false, args[0], global.packname, global.author)
      else throw '*الرابط الذي أرسلته غير صالح!*'
    }
  } catch (e) {
    console.error(e)
    if (!stiker) stiker = e
  } finally {
    if (stiker) {
        // إرسال الملصق النهائي
        conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    } else {
        throw `*خطأ: تأكد من إرسال صورة أو فيديو قصير ثم الرد عليه بكلمة .ملصق*`
    }
  }
}

// الأوامر التي يستجيب لها البوت بالعربي والإنجليزي
handler.help = ['ملصق', 'sticker']
handler.tags = ['sticker']
handler.command = ['ملصق', 'stiker', 'sticker', 'سوي_ملصق'] 

export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}

