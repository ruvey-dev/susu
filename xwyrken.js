module.exports = xwyrken = async (xwyrken, m, chatUpdate, store) => {
  try {
    const { jidNormalizedUser } = require('@whiskeysockets/baileys')

    const from = m.key.remoteJid
const body =
  m.message?.conversation ||
  m.message?.buttonsResponseMessage?.selectedButtonId ||
  m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
  m.message?.templateButtonReplyMessage?.selectedId ||
  (
    m.message?.interactiveResponseMessage &&
    JSON.parse(
      m.message.interactiveResponseMessage
        .nativeFlowResponseMessage?.paramsJson || '{}'
    ).id
  ) ||
  m.text ||
  ''
  
const prefix = '.'
const command = body.startsWith(prefix)
  ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
  : ''
const args = body.trim().split(/ +/).slice(1)
    const isGroup = jidNormalizedUser(from).endsWith('@g.us')

    // Ambil hanya ID pengirim
    function getSenderOnly(m) {
      const id = m.key.participant || m.key.remoteJid
      return id.includes('@') ? id : id + '@s.whatsapp.net'
    }
    const sender = getSenderOnly(m)
    const fs = require('fs')
    const { readFileSync, writeFileSync, existsSync } = require('fs')
    const datamemberFile = './all/database/datamember.json'
    const infoFile = './all/database/info.json'


    // Cek dan buat file info.json kalau belum ada
    if (!fs.existsSync(infoFile)) {
      const defaultInfo = {
        admin: 'xwyrken',
        dev: 'IP XR',
        roll: 'SAFARU, WIB',
        dana: '083897441426'
      }
      fs.writeFileSync(infoFile, JSON.stringify(defaultInfo, null, 2))
    }

//pengingat alias hadisk
const pathDb = './all/database/arisan.json'

if (!fs.existsSync(pathDb)) fs.writeFileSync(pathDb, JSON.stringify({}))

let db = JSON.parse(fs.readFileSync(pathDb))

// pakai id group bukan sender
const jid = m.chat

if (!db[jid]) {
db[jid] = {
besar: [],
kecil: []
}
}

const saveDb = () => {
fs.writeFileSync(pathDb, JSON.stringify(db, null, 2))
}
// ===== ANTITAG STATUS WA (FIX) =====
const antiswPath = './all/database/antisw.json'

let antitagDB = {}
if (fs.existsSync(antiswPath)) {
  antitagDB = JSON.parse(fs.readFileSync(antiswPath))
}

if (m.isGroup && antitagDB[m.chat]) {
  const isStatusMention =
    !!m.message?.groupStatusMentionMessage ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes('status@broadcast')

  if (isStatusMention) {
    // 🔥 JALAN DI BACKGROUND, JANGAN BLOCK HANDLER
    process.nextTick(async () => {
      try {
        await xwyrken.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
          }
        })
      } catch (e) {
        console.log('ANTITAGSW ERR:', e)
      }
    })
  }
}

// ❗ JANGAN RETURN DI SINI
// BIAR COMMAND TETAP DIPROSES

// handler antichannel
const antiPath = './all/database/antichannel.json'

let antiDB = {}
if (fs.existsSync(antiPath)) {
  antiDB = JSON.parse(fs.readFileSync(antiPath))
}

if (m.isGroup && antiDB[m.chat]) {

  // cek bot admin dulu
  const metadata = await xwyrken.groupMetadata(m.chat)
  const botNumber = xwyrken.user.id.split(':')[0] + '@s.whatsapp.net'

  const botIsAdmin = metadata.participants
    .find(p => p.id === botNumber)?.admin !== null

  if (!botIsAdmin) return // kalau bot bukan admin, stop

  // buka wrapper message
  const msg =
    m.message?.viewOnceMessage?.message ||
    m.message?.ephemeralMessage?.message ||
    m.message

  if (!msg) return

  const context =
    msg?.extendedTextMessage?.contextInfo ||
    msg?.imageMessage?.contextInfo ||
    msg?.videoMessage?.contextInfo ||
    msg?.documentMessage?.contextInfo ||
    msg?.pollCreationMessage?.contextInfo ||
    msg?.buttonsResponseMessage?.contextInfo ||
    msg?.listResponseMessage?.contextInfo ||
    {}

  const isChannel =
    msg?.groupStatusMentionMessage ||
    context?.forwardedNewsletterMessageInfo ||
    context?.mentionedJid?.includes('status@broadcast')

  if (isChannel) {

    const sender = m.key.participant || m.sender

    // owner aman
    if (sender.includes('62895413124456')) return

    try {
      await xwyrken.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: sender
        }
      })
    } catch (err) {
      console.log('ANTICHANNEL ERROR:', err)
    }
  }
}

// fungsi antilink
const antilinkPath = './all/database/antilink.json'

let antilinkDB = {}
if (fs.existsSync(antilinkPath)) {
  antilinkDB = JSON.parse(fs.readFileSync(antilinkPath))
}

// ambil text dari chat atau caption
const textMsg =
  m.text ||
  m.message?.imageMessage?.caption ||
  m.message?.videoMessage?.caption ||
  ''

// regex link grup
const linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i

// ✅ REGEX PREFIX (AMBIL DARI PREFIX STRING DI ATAS)
const prefixRegex = new RegExp(`^\\${prefix}`)

// antilink
if (
  m.isGroup &&
  antilinkDB[m.chat] &&
  linkRegex.test(textMsg) &&
  !prefixRegex.test(textMsg) // ⬅️ command AMAN
) {
  const groupMetadata = await xwyrken.groupMetadata(m.chat)
  const botNumber = xwyrken.user.id.split(':')[0] + '@s.whatsapp.net'
  const isBotAdmin = groupMetadata.participants.find(
    p => p.jid === botNumber
  )?.admin

  if (!isBotAdmin) return

  await xwyrken.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: m.key.id,
      participant: m.key.participant
    }
  })
}



    // 🧠 Simpan nomor otomatis saat ada member join grup
    const _chatJoinListener = async (xwyrken, m) => {
      try {
        const from = m.key.remoteJid
        const isGroup = jidNormalizedUser(from).endsWith('@g.us')
        if (!isGroup) return

        const mtext = m.message?.extendedTextMessage?.text || m.message?.conversation || ''
        const joinPattern = /^\+62\s?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4} bergabung menggunakan invite link$/i

        if (joinPattern.test(mtext)) {
          const nomor = mtext.match(/\+62\s?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/)[0]
            .replace(/\s|-/g, '')
            .replace('+', '')

          let db = []
          if (existsSync(datamemberFile)) db = JSON.parse(readFileSync(datamemberFile))
          if (!db.includes(nomor)) {
            db.push(nomor)
            writeFileSync(datamemberFile, JSON.stringify(db))
            console.log(`✅ Nomor baru tersimpan: ${nomor}`)
          }
        }
      } catch (e) {
        console.log('❌ Error simpan nomor:', e)
      }
    }

    await _chatJoinListener(xwyrken, m)

    const ownerFile = './all/database/owner.json'
    const ownerDB = fs.existsSync(ownerFile) ? JSON.parse(fs.readFileSync(ownerFile)) : []  
    const premFile = './all/database/premium.json'
const expireFile = './all/database/premexpire.json'

const prem = fs.existsSync(premFile) ? JSON.parse(fs.readFileSync(premFile)) : []
const expireDB = fs.existsSync(expireFile) ? JSON.parse(fs.readFileSync(expireFile)) : {}

// auto hapus premium yang sudah expired
for (const user in expireDB) {
  if (Date.now() > expireDB[user]) {
    const idx = prem.indexOf(user)
    if (idx !== -1) prem.splice(idx, 1)
    delete expireDB[user]
    fs.writeFileSync(premFile, JSON.stringify(prem, null, 2))
    fs.writeFileSync(expireFile, JSON.stringify(expireDB, null, 2))
  }
}

// cek status premium
const isPremium = prem.includes(sender) || expireDB[sender]
    const isOwner = ownerDB.includes(sender)
    const reply = (text, opt = {}) => xwyrken.sendMessage(from, { text, ...opt }, { quoted: m })

    // ========== COMMAND ========== //
    switch (command) {
case 'sewa': {
const fs = require('fs')

const API_BASE = 'https://cashify.my.id/api'
const LICENSE = global.cashifyLicenseKey
const QRIS_ID = global.cashifyQrisId

const premiumFile = './all/database/premium.json'
const expireFile = './all/database/premexpire.json'
const counterFile = './all/database/sewaid.json'
const trxFile = './all/database/sewatrx.json'

const list = {
  '1d': { name: 'SEWA 1 HARI', price: 1500, ms: 86400000, code: '01D' },
  '3d': { name: 'SEWA 3 HARI', price: 3500, ms: 3 * 86400000, code: '03D' },
  '7d': { name: 'SEWA 7 HARI', price: 7500, ms: 7 * 86400000, code: '07D' },
  '14d': { name: 'SEWA 14 HARI', price: 14500, ms: 14 * 86400000, code: '14D' },
  '30d': { name: 'SEWA 30 HARI', price: 20000, ms: 30 * 86400000, code: '30D' },
  'permanen': { name: 'SEWA PERMANEN', price: 35000, ms: 99999999 * 86400000, code: 'PERM' }
}

const dur = (args[0] || '').toLowerCase()
const opt = list[dur]

if (!opt) {
return reply(`Halo @${m.sender.split('@')[0]} 👋

• 1 Hari — 1,5K  
• 3 Hari — 3,5K  
• 7 Hari — 7,5K  
• 14 Hari — 14,5K  
• 30 Hari — 20K  
• Permanen — 35K  

Untuk membeli, ketik *.sewa (hari d) 1d*
> Setelah memilih durasi, bot akan mengirim QR pembayaran.  
Jika pembayaran berhasil, akses akan aktif otomatis.`)
}

if (!fs.existsSync('./all/database')) fs.mkdirSync('./all/database', { recursive: true })

let trxDB = fs.existsSync(trxFile) ? JSON.parse(fs.readFileSync(trxFile)) : []
const user = m.sender

const pending = trxDB.find(v => v.user === user && v.status === 'pending')
if (pending) {
return reply(`⚠️ Kamu masih punya transaksi belum dibayar

📑 ID: *${pending.label}*

Ketik:
.lanjut ${pending.label}`)
}

let counter = 1
if (fs.existsSync(counterFile)) {
counter = JSON.parse(fs.readFileSync(counterFile)).last + 1
}
fs.writeFileSync(counterFile, JSON.stringify({ last: counter }, null, 2))

const buyerId = String(counter).padStart(3, '0')
const trxLabel = `ID${buyerId}${opt.code}`

const fee = 50
const total = opt.price + fee

async function post(url, body){
const res = await fetch(url, {
method: 'POST',
headers: {
'content-type': 'application/json',
'x-license-key': LICENSE
},
body: JSON.stringify(body)
})
return res.json()
}

let resp
try {
resp = await post(`${API_BASE}/generate/qris`, {
id: QRIS_ID,
amount: total,
expiredInMinutes: 5,
useUniqueCode: true,
packageIds: ["id.dana"],
})
} catch (e) {
console.log(e)
return reply('❌ Gagal membuat QR')
}

const data = resp?.data || resp
if (!data || !data.qr_string) return reply('❌ Gagal membuat QR')

const trxId =
data.transactionId ||
data.id ||
resp.transactionId ||
resp.id

if (!trxId) {
return reply('❌ ID transaksi tidak ditemukan')
}

const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data.qr_string)}`

const sendQr = await xwyrken.sendMessage(m.chat, {
image: { url: qrUrl },
caption:
`🧾 *INVOICE PEMBAYARAN*

━━━━━━━━━━━━━━━━
📦 Produk  : ${opt.name}
🆔 ID      : ${trxLabel}
💰 Total   : Rp${total.toLocaleString('id-ID')}
⏳ Expired : 5 Menit
━━━━━━━━━━━━━━━━

📱 Silakan scan QR di atas untuk melakukan pembayaran.
> ⚠️ *Catatan:*  
> Jika pembayaran berhasil, akun pro otomatis di aktifkan oleh bot.`
}, { quoted: m })

trxDB.push({
user,
label: trxLabel,
product: opt.name,
transactionId: trxId,
dur,
ms: opt.ms,
status: 'pending',
created: Date.now()
})
fs.writeFileSync(trxFile, JSON.stringify(trxDB, null, 2))

let interval
interval = setInterval(async () => {
try {

const check = await fetch(`${API_BASE}/generate/check-status`, {
method: 'POST',
headers: {
'content-type': 'application/json',
'x-license-key': LICENSE
},
body: JSON.stringify({ transactionId: trxId })
})

const js = await check.json()
const statusRaw = js?.data?.status || js?.status || ''
const status = String(statusRaw).toUpperCase()

if (status === 'SUCCESS' || status === 'PAID') {

clearInterval(interval)

// HAPUS QR
await xwyrken.sendMessage(m.chat, { delete: sendQr.key })

let prem = fs.existsSync(premiumFile)
  ? JSON.parse(fs.readFileSync(premiumFile))
  : []

let exp = fs.existsSync(expireFile)
  ? JSON.parse(fs.readFileSync(expireFile))
  : {}

const now = Date.now()

if (!prem.includes(user)) prem.push(user)

if (exp[user] && exp[user] > now) {
  exp[user] += opt.ms
} else {
  exp[user] = now + opt.ms
}

fs.writeFileSync(premiumFile, JSON.stringify(prem, null, 2))
fs.writeFileSync(expireFile, JSON.stringify(exp, null, 2))

const idx = trxDB.findIndex(v => v.transactionId === trxId)
if (idx !== -1) trxDB[idx].status = 'success'
fs.writeFileSync(trxFile, JSON.stringify(trxDB, null, 2))

await xwyrken.sendMessage(m.chat, {
text: `✅ *PEMBAYARAN BERHASIL*

━━━━━━━━━━━━━━━
📦 *Produk*  : ${opt.name}
⏳ *Durasi*  : ${dur}
━━━━━━━━━━━━━━━

*🎉 Akses kamu sudah berhasil diaktifkan!*
> Terima kasih telah memilih bot kami 😎`
}, { quoted: m })

return
}

} catch (e) {
console.log('ERR CHECK:', e)
}

}, 5000)

setTimeout(async () => {

clearInterval(interval)

let db = fs.existsSync(trxFile) ? JSON.parse(fs.readFileSync(trxFile)) : []
const idx = db.findIndex(v => v.transactionId === trxId)

if (idx !== -1 && db[idx].status === 'pending') {

db[idx].status = 'expired'
fs.writeFileSync(trxFile, JSON.stringify(db, null, 2))

// HAPUS QR
await xwyrken.sendMessage(m.chat, { delete: sendQr.key })

await xwyrken.sendMessage(m.chat, {
text: `❌ Maaf transaksi sudah expired.

Silahkan lakukan pembelian ulang.`,
}, { quoted: m })

}

}, 5 * 60 * 1000)

}
break
case 'lanjut': {
const fs = require('fs')

const API_BASE = 'https://cashify.my.id/api'
const LICENSE = global.cashifyLicenseKey
const QRIS_ID = global.cashifyQrisId

const premiumFile = './all/database/premium.json'
const expireFile = './all/database/premexpire.json'
const trxFile = './all/database/sewatrx.json'

const label = args[0]
if (!label) return reply('Masukin ID transaksi\nContoh: .lanjut ID00101D')

let trxDB = fs.existsSync(trxFile)
  ? JSON.parse(fs.readFileSync(trxFile))
  : []

const trx = trxDB.find(v => v.label === label && v.user === m.sender)

if (!trx) return reply('❌ Transaksi tidak ditemukan / bukan milik kamu')
if (trx.status !== 'pending') return reply('❌ Transaksi sudah tidak aktif')

// 🔒 BATAS 1x
if (trx.used) {
  return reply('⚠️ .lanjut hanya bisa digunakan 1x')
}

// tandai sudah dipakai
trx.used = true
fs.writeFileSync(trxFile, JSON.stringify(trxDB, null, 2))

// ambil harga dari product lama
const priceMap = {
  'SEWA 1 HARI': 1500,
  'SEWA 3 HARI': 3500,
  'SEWA 7 HARI': 7500,
  'SEWA 14 HARI': 14500,
  'SEWA 30 HARI': 20000,
  'SEWA PERMANEN': 35000
}

const fee = 50
const total = (priceMap[trx.product] || 0) + fee

async function post(url, body){
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-license-key': LICENSE
    },
    body: JSON.stringify(body)
  })
  return res.json()
}

// 🔥 generate QR BARU
let resp
try {
  resp = await post(`${API_BASE}/generate/qris`, {
    id: QRIS_ID,
    amount: total,
    expiredInMinutes: 5,
    useUniqueCode: true,
    packageIds: ["id.dana"],
  })
} catch (e) {
  console.log(e)
  return reply('❌ Gagal generate QR ulang')
}

const data = resp?.data || resp
if (!data?.qr_string) return reply('❌ Gagal buat QR')

const trxId =
  data.transactionId ||
  data.id ||
  resp.transactionId ||
  resp.id

if (!trxId) return reply('❌ ID transaksi baru tidak ada')

// update trx lama pakai trxId baru
trx.transactionId = trxId
fs.writeFileSync(trxFile, JSON.stringify(trxDB, null, 2))

const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data.qr_string)}`

// kirim QR lagi
const sendQr = await xwyrken.sendMessage(m.chat, {
  image: { url: qrUrl },
  caption:
`🔄 *LANJUTKAN PEMBAYARAN*

━━━━━━━━━━━━━━━━
📦 Produk  : ${trx.product}
🆔 ID      : ${trx.label}
💰 Total   : Rp${total.toLocaleString('id-ID')}
⏳ Expired : 5 Menit
━━━━━━━━━━━━━━━━

Silakan scan ulang QR di atas ya.`
}, { quoted: m })

// 🔁 polling lagi
let interval
interval = setInterval(async () => {
try {

const check = await fetch(`${API_BASE}/generate/check-status`, {
method: 'POST',
headers: {
'content-type': 'application/json',
'x-license-key': LICENSE
},
body: JSON.stringify({ transactionId: trxId })
})

const js = await check.json()
const statusRaw = js?.data?.status || js?.status || ''
const status = String(statusRaw).toUpperCase()

if (status === 'SUCCESS' || status === 'PAID') {

clearInterval(interval)

// hapus QR
await xwyrken.sendMessage(m.chat, { delete: sendQr.key })

let prem = fs.existsSync(premiumFile)
  ? JSON.parse(fs.readFileSync(premiumFile))
  : []

let exp = fs.existsSync(expireFile)
  ? JSON.parse(fs.readFileSync(expireFile))
  : {}

const now = Date.now()

if (!prem.includes(m.sender)) prem.push(m.sender)

if (exp[m.sender] && exp[m.sender] > now) {
  exp[m.sender] += trx.ms
} else {
  exp[m.sender] = now + trx.ms
}

fs.writeFileSync(premiumFile, JSON.stringify(prem, null, 2))
fs.writeFileSync(expireFile, JSON.stringify(exp, null, 2))

trx.status = 'success'
fs.writeFileSync(trxFile, JSON.stringify(trxDB, null, 2))

await xwyrken.sendMessage(m.chat, {
text: `✅ *PEMBAYARAN BERHASIL*

📦 ${trx.product}
⏳ ${trx.dur}

Akses aktif 🎉`
}, { quoted: m })

}

} catch (e) {
console.log(e)
}

}, 5000)

// expired ulang
setTimeout(async () => {

clearInterval(interval)

let db = JSON.parse(fs.readFileSync(trxFile))
const t = db.find(v => v.label === trx.label)

if (t && t.status === 'pending') {

t.status = 'expired'
fs.writeFileSync(trxFile, JSON.stringify(db, null, 2))

await xwyrken.sendMessage(m.chat, { delete: sendQr.key })

await xwyrken.sendMessage(m.chat, {
text: '❌ Transaksi expired lagi, silakan beli ulang'
}, { quoted: m })

}

}, 5 * 60 * 1000)

}
break
case 'perpanjang': {
const fs = require('fs')

const API_BASE = 'https://cashify.my.id/api'
const LICENSE = global.cashifyLicenseKey
const QRIS_ID = global.cashifyQrisId

const premiumFile = './all/database/premium.json'
const expireFile = './all/database/premexpire.json'
const counterFile = './all/database/sewaid.json'
const trxFile = './all/database/sewatrx.json'

const list = {
  '1d': { name: 'PERPANJANG 1 HARI', price: 1500, ms: 86400000, code: '01D' },
  '3d': { name: 'PERPANJANG 3 HARI', price: 3500, ms: 3 * 86400000, code: '03D' },
  '7d': { name: 'PERPANJANG 7 HARI', price: 7500, ms: 7 * 86400000, code: '07D' },
  '14d': { name: 'PERPANJANG 14 HARI', price: 14500, ms: 14 * 86400000, code: '14D' },
  '30d': { name: 'PERPANJANG 30 HARI', price: 20000, ms: 30 * 86400000, code: '30D' }
}

const dur = (args[0] || '').toLowerCase()
const opt = list[dur]

if (!opt) {
return reply(`Gunakan format:
.perpanjang 1d
.perpanjang 3d
.perpanjang 7d
.perpanjang 14d
.perpanjang 30d`)
}

if (!fs.existsSync('./all/database')) fs.mkdirSync('./all/database', { recursive: true })

let prem = fs.existsSync(premiumFile)
  ? JSON.parse(fs.readFileSync(premiumFile))
  : []

let exp = fs.existsSync(expireFile)
  ? JSON.parse(fs.readFileSync(expireFile))
  : {}

const user = m.sender

if (!prem.includes(user) || !exp[user]) {
return reply('❌ Kamu belum memiliki durasi aktif.')
}

let trxDB = fs.existsSync(trxFile) ? JSON.parse(fs.readFileSync(trxFile)) : []

const pending = trxDB.find(v => v.user === user && v.status === 'pending')
if (pending) {
return reply(`⚠️ Kamu masih punya transaksi belum dibayar

📑 ID: *${pending.label}*`)
}

let counter = 1
if (fs.existsSync(counterFile)) {
counter = JSON.parse(fs.readFileSync(counterFile)).last + 1
}
fs.writeFileSync(counterFile, JSON.stringify({ last: counter }, null, 2))

const buyerId = String(counter).padStart(3, '0')
const trxLabel = `ID${buyerId}${opt.code}`

const fee = 50
const total = opt.price + fee

async function post(url, body){
const res = await fetch(url, {
method: 'POST',
headers: {
'content-type': 'application/json',
'x-license-key': LICENSE
},
body: JSON.stringify(body)
})
return res.json()
}

let resp
try {
resp = await post(`${API_BASE}/generate/qris`, {
id: QRIS_ID,
amount: total,
expiredInMinutes: 5,
useUniqueCode: true,
packageIds: ["id.dana"],
})
} catch (e) {
return reply('❌ Gagal membuat QR')
}

const data = resp?.data || resp
if (!data || !data.qr_string) return reply('❌ Gagal membuat QR')

const trxId =
data.transactionId ||
data.id ||
resp.transactionId ||
resp.id

if (!trxId) return reply('❌ ID transaksi tidak ditemukan')

const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=30-144-255&data=${encodeURIComponent(data.qr_string)}`

const sendQr = await xwyrken.sendMessage(m.chat, {
image: { url: qrUrl },
caption:
`🔄 *TRANSAKSI PERPANJANG DURASI*
━━━━━━━━━━━━━━━
📦 Produk : ${opt.name}
📑 ID     : ${trxLabel}
💰 Total  : Rp${total.toLocaleString('id-ID')}
⏳ Expired : 5 menit`
}, { quoted: m })

trxDB.push({
user,
label: trxLabel,
product: opt.name,
transactionId: trxId,
dur,
ms: opt.ms,
status: 'pending',
created: Date.now()
})
fs.writeFileSync(trxFile, JSON.stringify(trxDB, null, 2))

let interval
interval = setInterval(async () => {
try {

const check = await fetch(`${API_BASE}/generate/check-status`, {
method: 'POST',
headers: {
'content-type': 'application/json',
'x-license-key': LICENSE
},
body: JSON.stringify({ transactionId: trxId })
})

const js = await check.json()
const statusRaw = js?.data?.status || js?.status || ''
const status = String(statusRaw).toUpperCase()

if (status === 'SUCCESS' || status === 'PAID') {

clearInterval(interval)

await xwyrken.sendMessage(m.chat, { delete: sendQr.key })

const now = Date.now()

// TAMBAH MASA AKTIF
if (exp[user] && exp[user] > now) {
  exp[user] += opt.ms
} else {
  exp[user] = now + opt.ms
}

fs.writeFileSync(expireFile, JSON.stringify(exp, null, 2))

const idx = trxDB.findIndex(v => v.transactionId === trxId)
if (idx !== -1) trxDB[idx].status = 'success'
fs.writeFileSync(trxFile, JSON.stringify(trxDB, null, 2))

await xwyrken.sendMessage(m.chat, {
text: `✅ Perpanjang berhasil!

⏳ Durasi ditambah : ${dur}`,
}, { quoted: m })

return
}

} catch (e) {}

}, 5000)

setTimeout(async () => {

clearInterval(interval)

let db = fs.existsSync(trxFile) ? JSON.parse(fs.readFileSync(trxFile)) : []
const idx = db.findIndex(v => v.transactionId === trxId)

if (idx !== -1 && db[idx].status === 'pending') {

db[idx].status = 'expired'
fs.writeFileSync(trxFile, JSON.stringify(db, null, 2))

await xwyrken.sendMessage(m.chat, { delete: sendQr.key })

await xwyrken.sendMessage(m.chat, {
text: `❌ Transaksi perpanjang expired.`,
}, { quoted: m })

}

}, 5 * 60 * 1000)

}
break
case 'lanjut': {
const fs = require('fs')

const API_BASE = 'https://cashify.my.id/api'
const LICENSE = global.cashifyLicenseKey

const premiumFile = './all/database/premium.json'
const expireFile = './all/database/premexpire.json'
const trxFile = './all/database/sewatrx.json'

const id = args[0]
if (!id) return reply('❌ Masukkan ID transaksi\nContoh: .lanjut ID00101D')

if (!fs.existsSync(trxFile)) return reply('❌ Tidak ada transaksi')

let trxDB = JSON.parse(fs.readFileSync(trxFile))
const trx = trxDB.find(v => v.label === id && v.user === m.sender)

if (!trx) return reply('❌ Transaksi tidak ditemukan')
if (trx.status === 'success') return reply('✅ Transaksi sudah berhasil sebelumnya')
if (trx.status === 'expired') return reply('❌ Transaksi sudah expired')

const trxId = trx.transactionId

try {

const check = await fetch(`${API_BASE}/generate/check-status`, {
method: 'POST',
headers: {
'content-type': 'application/json',
'x-license-key': LICENSE
},
body: JSON.stringify({ transactionId: trxId })
})

const js = await check.json()
console.log('LANJUT CHECK:', JSON.stringify(js, null, 2))

const status = js?.data?.status || js?.status
const paid = js?.data?.paid || js?.paid

if (status === 'SUCCESS' || status === 'PAID' || paid === true) {

let prem = fs.existsSync(premiumFile) ? JSON.parse(fs.readFileSync(premiumFile)) : []
let exp = fs.existsSync(expireFile) ? JSON.parse(fs.readFileSync(expireFile)) : {}

const now = Date.now()

if (!prem.includes(m.sender)) prem.push(m.sender)

if (exp[m.sender] && exp[m.sender] > now) {
exp[m.sender] += trx.ms
} else {
exp[m.sender] = now + trx.ms
}

fs.writeFileSync(premiumFile, JSON.stringify(prem, null, 2))
fs.writeFileSync(expireFile, JSON.stringify(exp, null, 2))

// update status
const idx = trxDB.findIndex(v => v.transactionId === trxId)
if (idx !== -1) trxDB[idx].status = 'success'
fs.writeFileSync(trxFile, JSON.stringify(trxDB, null, 2))

return reply(`✅ Pembayaran berhasil terdeteksi!

📦 Produk : ${trx.product}`)

} else {

return reply(`⏳ Pembayaran belum diterima

📑 ID : ${trx.label}

Silahkan selesaikan pembayaran 🙏`)

}

} catch (e) {
console.log(e)
reply('❌ Gagal cek transaksi')
}

}
break

break
case 'owner': {
  const fs = require('fs')

  // baca foto jadi buffer
  const thumb = fs.readFileSync('./all/image/qris.jpg')

  const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;RUVEY;;;
FN:RUVEY
ORG:👑 RUVEY DEVELOPER
TITLE:Owner & Creator Bot
TEL;type=CELL;type=VOICE;waid=62895413124456:+62895413124456
END:VCARD
`

  await xwyrken.sendMessage(from, {
    contacts: {
      displayName: '👑 RUVEY | XAVIOR BOT',
      contacts: [{ vcard }]
    },
    contextInfo: {
      externalAdReply: {
        title: '✨ RUVEY - XAVIOR BOT ✨',
        body: 'Owner & Developer Resmi 💼',
        mediaType: 1,
        showAdAttribution: false,
        renderLargerThumbnail: true,
        thumbnail: thumb, // 🔥 FOTO MASUK DI SINI
        sourceUrl: 'https://wa.me/6289619173779'
      }
    }
  }, { quoted: m })

  break
}
case 'menu': {
  if (!isPremium) return

  const now = Date.now()

  // hitung total premium aktif
  let totalPrem = 0
  for (let jid in expireDB) {
    if (expireDB[jid] > now) totalPrem++
  }

  // ===== WAKTU WIB =====
  const hour = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  ).getHours()

  let greetTitle = ''
  let greetLine = ''
  let emoji = ''

  if (hour >= 4 && hour < 11) {
    greetTitle = 'GOOD MORNING'
    greetLine = 'Selamat Pagi'
    emoji = '🌅'
  } else if (hour >= 11 && hour < 15) {
    greetTitle = 'GOOD DAY'
    greetLine = 'Selamat Siang'
    emoji = '🌞'
  } else if (hour >= 15 && hour < 18) {
    greetTitle = 'GOOD EVENING'
    greetLine = 'Selamat Sore'
    emoji = '🌇'
  } else {
    greetTitle = 'GOOD NIGHT'
    greetLine = 'Selamat Malam'
    emoji = '🌙'
  }

  const mentionUser = m.sender

  const menuText = `
${emoji}  ${greetTitle}
Halo @${mentionUser.split('@')[0]}
${greetLine} — semoga harimu menyenangkan ✨

╔═〔 𝗥𝗨𝗩𝗘𝗬 𝗩𝗩𝗜𝗣 𝗦𝗬𝗦𝗧𝗘𝗠 〕═╗
║ Version   : 9.1.28.1
║ Status    : VVIP ACTIVE
║ Premium   : ${totalPrem} User
║ System    : SEWA OTOMATIS
╚═════════════════════╝

⟪ MAIN ⟫
• .ping
• .cek
• .owner
• .pay
• .sewa
• .depo
• .dgs
• .fe

⟪ VVIP ⟫
• .lw
• .lwg
• .setlw
• .cl
• .b   • .k
• .wk  • .wb
• .winkanan
• .winkiri
• .r
• .s
• .hasil
• .dels
• .kurang

⟪ GROUP ⟫
• .buka
• .tutup
• .h
• .setpp
• .p
• .antilink
• .antitagsw
• .admin
• .und
• .kick

⟪ CEO ⟫
• .listprem
• .adp
• .delp

╭───────────────╮
  Ketik .help untuk detail
  © 2026 Ruvey System
╰───────────────╯
`

  reply(menuText, { mentions: [mentionUser] })
}
break
case 'help': {
  const cmd = (args[0] || '').toLowerCase()

  let text = '*HELP MENU*\n\n'

  if (!cmd) {
    text += `
Ketik:
.help lw
.help s
.help depo
.help antitagsw
.help group
`
  }

  else if (cmd === 'lw') {
    text = `
*LW — LAST WIN*

Menampilkan data last win hari ini:
• Game terakhir
• Saldo mafia
• Utang (jika ada)

Contoh:
.lw
`
  }

  else if (cmd === 's') {
    text = `
*S — SALDO*

Menampilkan saldo user:
• Saldo terbesar di atas
• Utang hanya tampil jika ada

Contoh:
.s
`
  }

  else if (cmd === 'depo') {
    text = `
*DEPO — DEPOSIT*

Menambah saldo user.

Contoh:
.depo alex 50000
`
  }

  else if (cmd === 'antitagsw') {
    text = `
*ANTITAGSW*

Auto jeda admin 2 menit
Jika tag status WhatsApp

Contoh:
.antitagsw on
.antitagsw off
`
  }

  else if (cmd === 'group') {
    text = `
*GROUP COMMAND*

.buka / .tutup
.kick / .admin / .und
.setpp / .antilink
`
  }

  else {
    text = 'Command tidak ditemukan.'
  }

  reply(text.trim())
  break
}
case 'pay':
case 'payment': {
  const teksPayment = `*ALL PAYMENT ruvey*

Dana : 0838-9744-1426

⚠️ *PENTING*
Wajib kirim bukti transfer di GB bot
https://chat.whatsapp.com/HmvkMJiQ20y3jzaR5RhLhn?mode=gi_t`

  await xwyrken.sendMessage(
    m.chat,
    { text: teksPayment },
    { quoted: m }
  )

  break
}
case 'share': {
  const allowed = '62895413124456@s.whatsapp.net'
  if (!m.sender.includes(allowed)) return reply('Lu bukan owner!')

  const pesan = m.text.split(' ').slice(1).join(' ')
  if (!pesan) return reply('Masukin textnya!\nContoh:\n.share Promo bot 🔥')

  if (global.autoShare) return reply('Auto share sudah aktif!')

  global.autoShare = true
  global.shareText = pesan

  reply('✅ Auto share aktif tiap 1 jam!')

  const delay = ms => new Promise(res => setTimeout(res, ms))

  async function autoShare() {
    while (global.autoShare) {
      try {
        let groups = await xwyrken.groupFetchAllParticipating()
        let groupIds = Object.keys(groups)

        for (let id of groupIds) {
          await xwyrken.sendMessage(id, {
            text: global.shareText
          })
        }

        console.log('Broadcast berhasil')
      } catch (err) {
        console.log('Error share:', err)
      }

      await delay(3600000)
    }
  }

  autoShare()
}
break
case 'stopshare': {
  const allowed = '62895413124456@s.whatsapp.net'
  if (m.sender !== allowed) return reply('Lu bukan owner!')

  global.autoShare = false
  reply('❌ Auto share dimatikan!')
}
break               
case 'ping': {
  if (!isPremium) break

  const start = Date.now()

  const senderNum = m.sender.split('@')[0]

  // pesan awal
  const sent = await xwyrken.sendMessage(m.chat, {
    text: '⏳ menghitung...'
  }, { quoted: m })

  // respon WA
  const ping = Date.now() - start

  // runtime bot
  const runtime = process.uptime()
  const jam = Math.floor(runtime / 3600)
  const menit = Math.floor((runtime % 3600) / 60)
  const detik = Math.floor(runtime % 60)

  const teks = `@${senderNum} bot aktif kak 🤖
⏱️ run: ${menit}m ${detik}d
📡 respon: ${ping} ms
🕒 aktif: ${jam} jam`

  await xwyrken.sendMessage(m.chat, {
    text: teks,
    mentions: [m.sender],
    edit: sent.key
  })

  break
}

case 'adg': {
  if (!isPremium) return 

  const fs = require('fs')
  const dir = './all/database'
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const sender = m.sender // 628xx@s.whatsapp.net

  // cek mode dari command
  const modeArg = m.text.trim().split(/\s+/)[1]?.toLowerCase()
  const isKK = modeArg === 'kanan' || modeArg === 'kiri'

  // path file
  const gamePath = isKK
    ? `${dir}/gamehistory_kanankiri.json`
    : `${dir}/gamehistory.json`

  const profitPath = isKK
    ? `${dir}/profit_kanankiri.json`
    : `${dir}/profit.json`

  // ambil isi setelah .adg / .adg kanan
  const text = m.text
    .replace(/^\.adg(\s+(kanan|kiri))?/i, '')
    .trim()

  const lines = text
    .split('\n')
    .map(v => v.trim())
    .filter(Boolean)

  if (!lines.length) return reply('❌ Tidak ada data')

  // load db
  let historyDB = fs.existsSync(gamePath)
    ? JSON.parse(fs.readFileSync(gamePath))
    : {}

  let profitDB = fs.existsSync(profitPath)
    ? JSON.parse(fs.readFileSync(profitPath))
    : {}

  // slot per WA
  if (!Array.isArray(historyDB[sender])) historyDB[sender] = []
  if (!Array.isArray(profitDB[sender])) profitDB[sender] = []

  let output = ''

  for (let line of lines) {
    const teks = line.toLowerCase()

    let winner = null

    // PRIORITAS kanan / kiri
    if (/\bkanan\b/.test(teks)) winner = 'KANAN'
    else if (/\bkiri\b/.test(teks)) winner = 'KIRI'

    // kalau tidak ada → pakai k / b
    else if (/^k\b/.test(teks)) winner = 'K'
    else if (/^b\b/.test(teks)) winner = 'B'

    if (!winner) continue

    // skor ambil angka pertama
    const skor = Number(teks.match(/(\d+)/)?.[1])
    const bl   = Number(teks.match(/\bbl\s*(\d+)/)?.[1])
    const fee  = Number(teks.match(/\bf\s*(\d+)/)?.[1])
    if ([skor, bl, fee].some(v => isNaN(v))) continue

    // simpan per WA
    historyDB[sender].push(`${winner} ${skor} (${bl}) / ${fee}`)

    profitDB[sender].push({
      winner,
      skor,
      fee,
      time: Date.now()
    })

    const teksWinner =
      winner === 'K' ? 'KECIL'
      : winner === 'B' ? 'BESAR'
      : winner

    output += `*${teksWinner}* ${skor} *(${bl})*\n`
  }

  fs.writeFileSync(gamePath, JSON.stringify(historyDB, null, 2))
  fs.writeFileSync(profitPath, JSON.stringify(profitDB, null, 2))

  reply(output.trim() || '❌ Tidak ada data valid')
}
break


      case 'del': {
  if (!isGroup) return reply('⚠️ KHUSUS GRUP')
  if (!isPremium) return
  if (!m.quoted) return reply('❗ Balas pesan yang ingin dihapus.')

  try {
    await xwyrken.sendMessage(from, {
      delete: {
        remoteJid: from,
        fromMe: false,
        id: m.quoted.id,
        participant: m.quoted.sender
      }
    })
  } catch (e) {
    reply('❌ Gagal menghapus pesan.')
  }
}
break

case 'setlw': {
  if (!isPremium) return

  const fs = require('fs')
  const path = require('path')

  const dbPath = './all/database'
  const filePath = path.join(dbPath, 'lwinfo.json')

  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })

  const text = args.join(' ')
  if (!text) {
    return reply(
      '*‼️ Contoh:*\n' +
      '.setlw *ETMIN xwyrken*\n' +
      '*DEV IP XR , SAFARI*\n' +
      '*SAFARI, WIB*\n' +
      '*DANA:* 0838-9744-1426\n' +
      '*QRIS TF PP*'
    )
  }

  let lwData = {}
  if (fs.existsSync(filePath)) {
    try {
      lwData = JSON.parse(fs.readFileSync(filePath))
    } catch {
      lwData = {}
    }
  }

  // simpan
  lwData[m.sender] = text.trim()
  fs.writeFileSync(filePath, JSON.stringify(lwData, null, 2))

  const senderNum = m.sender.split('@')[0]

  // kirim info (bukan reply)
  await xwyrken.sendMessage(m.chat, {
    text: `*INFO LIST WIN* @${senderNum} *BERHASIL DISIMPAN* ✅`,
    mentions: [m.sender]
  })

  break
}
case 'r': {
  if (!isPremium) return 
  if (!m.quoted || !m.quoted.text) return m.reply('MANA LIST NYA')

  const lines = m.quoted.text.trim().split('\n')

  let kategori1 = ''
  let kategori2 = ''
  let angka1 = []
  let angka2 = []
  let kategoriSekarang = null

  const emojiList = [
  '♟️','🀄','🧧','🎴','🐉','🐯','🐻','🧸','🐼','🐨','🐱','🐶','🎱','🍻','💋','🕷️','🔮',
  '☙','❧','❦','❥','❣','♡','♥','❀','✿','❁','❃','❋'
]
  const emoji = emojiList[Math.floor(Math.random() * emojiList.length)]

  // ===== PARSING =====
  for (let line of lines) {
    line = line.trim()

    const kategoriMatch = line.match(/^(.+?)\s*:\s*$/)
    if (kategoriMatch) {
      if (!kategori1) {
        kategori1 = kategoriMatch[1].trim()
        kategoriSekarang = 'k1'
      } else if (!kategori2) {
        kategori2 = kategoriMatch[1].trim()
        kategoriSekarang = 'k2'
      }
      continue
    }

    if (kategoriSekarang) {
      const nums = line.match(/\d+/g)
      if (nums) {
        const angka = nums.map(v => parseInt(v))
        if (kategoriSekarang === 'k1') angka1.push(...angka)
        if (kategoriSekarang === 'k2') angka2.push(...angka)
      }
    }
  }

  // ===== HITUNG =====
  const total1 = angka1.reduce((a, b) => a + b, 0)
  const total2 = angka2.reduce((a, b) => a + b, 0)
  const selisih = Math.abs(total1 - total2)

  // ===== OUTPUT LIST =====
let bagian = []

if (total1 > 0) {
  bagian.push(`${emoji} *${kategori1}*: ${angka1.join(', ')} = *${total1}*`)
}

if (total2 > 0) {
  bagian.push(`${emoji} *${kategori2}*: ${angka2.join(', ')} = *${total2}*`)
}

if (bagian.length === 0) return m.reply('TIDAK ADA ISI✖️')

let output = bagian.join('\n\n')

// ===== STATUS =====
const seimbang = total1 === total2

if (seimbang) {
  output += `\n\n*${kategori1}* dan *${kategori2}* Seimbang`
}

await m.reply(output)

  // ===== PESAN KEDUA =====
  if (seimbang) {

    await xwyrken.sendMessage(m.chat, {
      text: `CEK NIK KALIAN MASING” KOAR² SETELAH ROL @${m.sender.split('@')[0]} ANGUSIN AJA 😹`,
      mentions: [m.sender]
    })

  } else {

    const kecil = total1 < total2 ? kategori1 : kategori2

    function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

let teks = ''

if (selisih <= 10) {
  const kata = [
    'SIKIT LAGI!',
    'DIKIT LAGI GC!',
    'ROLLIN BES!',
    'KASIH PAHAM BOS!',
    'GC GAS!',
    'BENTAR LAGI TEMBUS!'
  ]
  teks = `*${kecil} -${selisih}* ${pick(kata)}`
}

else if (selisih <= 20) {
  const kata = [
    'GAS SISA DIKIT LAGI!',
    'CUAN BOS!',
    'GC ROLLIN!',
    'KASIH PAHAM BOS!',
    'DIKIT LAGI🔥!',
    'ALL GAS GC!'
  ]
  teks = `*${kecil} -${selisih}* ${pick(kata)}`
}

else if (selisih <= 30) {
  const kata = [
    'CUAN!',
    'CUAN BOS!',
    'ROLLIN CUAN!',
    'ALLIN ROL GC!',
    'SISA DIKIT LAGI!',
    'CUAN!'
  ]
  teks = `*${kecil} -${selisih}* ${pick(kata)}`
}

else if (selisih <= 100) {
  const kata = [
    'ALLIN CUAN 😍',
    'GCCC BESS!',
    'ROLLIN PEDE!',
    'CUAN BESAR BOS!',
    'GCAN!',
    'ALLIN JANGAN RAGU!'
  ]
  teks = `*${kecil} -${selisih}* ${pick(kata)}`
}

else {
  const kata = [
    'ALL/ECER CUAN!',
    'GCCC!',
    'BESARIN TARUHAN!',
    'GAS ALLIN BOS!',
    'ROLLIN BOS!',
    'CUAN!'
  ]
  teks = `*${kecil} -${selisih}* ${pick(kata)}`
}

    await xwyrken.sendMessage(m.chat, { text: teks })
  }

  break
}
case 'c': {
  if (!isPremium) return
  if (!m.quoted || !m.quoted.text) return m.reply('⚠️ REPLY LIST NYA')

  const fs = require('fs')
  const userFile = './database/userdata.json'
  const nikFile = './all/database/nik.json'
  const pathDb = './all/database'

  if (!fs.existsSync(userFile)) {
    return m.reply('❌ userdata.json tidak ditemukan')
  }

  const userData = JSON.parse(fs.readFileSync(userFile))
  const saldoUser = userData[m.sender]?.saldo || {}

  // ===== AMBIL NAMA TANPA TAG =====
  let pushName = await xwyrken.getName(m.sender)
  if (!pushName) pushName = m.sender.split('@')[0]

  // ===== LOAD NIK =====
  let nikDB = fs.existsSync(nikFile)
    ? JSON.parse(fs.readFileSync(nikFile))
    : []

  const lines = m.quoted.text.trim().split('\n')

  let kategori1 = ''
  let kategori2 = ''
  let angka1 = []
  let angka2 = []
  let kategoriSekarang = null

  let belumTF = []
  let tukangUtang = []
  let listLF = []
  let listKurang = []
  let pemainBaru = []

  const pushUnique = (arr, value) => {
    if (!arr.find(v => v.split(' ')[0] === value.split(' ')[0])) {
      arr.push(value)
    }
  }

  // ===== PARSING =====
  for (let line of lines) {
    line = line.trim()
    if (!line) continue

    const header = line.match(/^(.+?)\s*:\s*$/)
    if (header) {
      const namaKategori = header[1].trim().toUpperCase()
      if (!kategori1) {
        kategori1 = namaKategori
        kategoriSekarang = 'k1'
      } else if (!kategori2) {
        kategori2 = namaKategori
        kategoriSekarang = 'k2'
      }
      continue
    }

    const data = line.match(/^(.+?)\s+(\d+)(?:\s*(lf))?$/i)
    if (!data || !kategoriSekarang) continue

    const nama = data[1].trim().toUpperCase()
    const nilai = parseInt(data[2])
    const isLF = !!data[3]
    const saldo = saldoUser[nama]

    if (!nikDB.includes(nama)) {
      nikDB.push(nama)
      pemainBaru.push(nama)
    }

    if (isLF) pushUnique(listLF, `${nama} ${nilai}`)

    if ((saldo === undefined || saldo === 0) && !isLF) {
      pushUnique(belumTF, `${nama} ${nilai}`)
    }

    if (typeof saldo === 'number' && saldo < 0) {
      pushUnique(tukangUtang, `${nama} ${saldo}`)
    }

    if (nilai > 0) {
      if (kategoriSekarang === 'k1') angka1.push(nilai)
      if (kategoriSekarang === 'k2') angka2.push(nilai)

      if (typeof saldo === 'number' && saldo > 0 && saldo < nilai) {
        const kurang = nilai - saldo
        pushUnique(listKurang, `${nama} +${kurang}`)
      }
    }
  }

  fs.writeFileSync(nikFile, JSON.stringify(nikDB, null, 2))

  const sortDesc = arr =>
    arr.sort((a, b) => parseInt(b.split(' ')[1]) - parseInt(a.split(' ')[1]))

  listLF = sortDesc(listLF)
  belumTF = sortDesc(belumTF)
  tukangUtang = sortDesc(tukangUtang)
  listKurang = sortDesc(listKurang)

  const total1 = angka1.reduce((a, b) => a + b, 0)
  const total2 = angka2.reduce((a, b) => a + b, 0)

  const totalSaldo = Object.values(saldoUser)
    .filter(v => v > 0)
    .reduce((a, b) => a + b, 0)

  // ===== HITUNG GAJI =====
  const files = [
    `${pathDb}/profit.json`,
    `${pathDb}/profit_kanankiri.json`,
    `${pathDb}/profitperak.json`
  ]

  let gajiKamu = 0

  for (const file of files) {
    if (!fs.existsSync(file)) continue

    const data = JSON.parse(fs.readFileSync(file))
    if (!data[m.sender]) continue

    const total = data[m.sender]
      .map(v => Number(v.fee) || 0)
      .filter(v => v > 0)
      .reduce((a, b) => a + b, 0)

    gajiKamu += total
  }

  // ===== AMBIL ANGKA (FORMAT K) =====
  const ambilK = (val) => {
    if (!val) return 0
    val = String(val).toLowerCase().replace(/\./g, '')
    return parseInt(val.replace(/[^\d]/g, '')) || 0
  }

  const totalSaldoK = ambilK(totalSaldo)
  const gajiK = ambilK(gajiKamu)
  const saldoQris = totalSaldoK + gajiK

  // ===== RINGKASAN =====
  let ringkasan = `☘︎ RINGKASAN :
${kategori1} : *${total1}*
${kategori2} : *${total2}*
TOTAL AMOUNT : *${totalSaldoK}K*
GAJI KAMU : *${gajiK}K*
SALDO QRIS💳 : *${saldoQris}K*`

  // ===== SELISIH =====
  let selisihText = ''
  if (total1 === total2) {
    selisihText = `☘︎ SELISIH :
SEIMBANG ✅`
  } else {
    const kecil = total1 < total2 ? kategori1 : kategori2
    const selisih = Math.abs(total1 - total2)
    selisihText = `☘︎ SELISIH :
${kecil} -${selisih}`
  }

  // ===== SECTION DINAMIS =====
  let sections = []

  if (belumTF.length) {
    sections.push(`☘︎ BELUM TF :
${belumTF.join('\n')}`)
  }
  
  if (listKurang.length) {
    sections.push(`☘︎ KURANG :
${listKurang.join('\n')}`)
  }
  
  if (tukangUtang.length) {
    sections.push(`☘︎ TUKANG UTANG :
${tukangUtang.join('\n')}`)
  }

  if (listLF.length) {
    sections.push(`☘︎ LIST LF :
${listLF.join('\n')}`)
  }

  if (pemainBaru.length) {
    sections.push(`☘︎ BUYER NEW :
${pemainBaru.map(v => `⤷ ${v}`).join('\n')}`)
  }

  if (!sections.length) {
    sections.push('Tidak ada data ⚠️')
  }

  // ===== OUTPUT FINAL =====
  let out = `*─➤ DETECTION PLAYER FOR ADMIN ${pushName}*
*——————*
${sections.join('\n*——————*\n')}
*——————*
${ringkasan}
*——————*
${selisihText}
`

  await xwyrken.sendMessage(m.chat, { text: out })

  break
}
case 'setpp': {
  if (!isGroup) return reply('❗ Hanya bisa di grup!')
  if (!isPremium) return 

  if (!m.quoted || !/image/.test(m.quoted.mtype))
    return reply('📸 Reply ke gambar yang ingin dijadikan foto profil grup!')

  try {
    const media = await m.quoted.download()
    if (typeof xwyrken.updateProfilePicture === 'function') {
      await xwyrken.updateProfilePicture(m.chat, media)
    } else {
      await xwyrken.query({
        tag: 'iq',
        attrs: { to: m.chat, type: 'set', xmlns: 'w:profile:picture' },
        content: [{ tag: 'picture', attrs: { type: 'image' }, content: media }]
      })
    }
    reply('☑️ Foto profil grup berhasil diubah')
  } catch (e) {
    console.error(e)
    reply('❌ Gagal mengubah foto profil grup!')
  }
  break
}
case 'pp': {
  if (!isGroup) return

  try {
    const ppgroup = await xwyrken.profilePictureUrl(m.chat, 'image')

    const sender = m.sender
    const tag = '@' + sender.split('@')[0]

    await xwyrken.sendMessage(m.chat, {
      image: { url: ppgroup },
      caption: `*⚠️ PERINGATAN CLONE ${tag} INI QRIS NYA YANG ASLI, PASTIKAN CEK ULANG NIK QRIS!*`,
      mentions: [sender]
    })

  } catch (e) {
    // kalo ga ada PP grup, diem aja
  }
  break
}
case 'rekap': {
  if (!isPremium)
    return 

  if (!m.quoted || !m.quoted.text)
    return reply('❌ Harap reply pesan dengan format data yang valid!')

  const getFee = (n) => Math.floor(n / 10) + 1

  const lines = m.quoted.text
    .split('\n')
    .map(v => v.trim())
    .filter(v => v)

  const dataKategori = {}
  const feeKategori = {}
  let currentKategori = null

  for (let line of lines) {
    // DETEKSI KATEGORI (BEBAS NAMA)
    if (/^.+:\s*$/i.test(line)) {
      currentKategori = line.slice(0, -1).trim()
      dataKategori[currentKategori] = []
      feeKategori[currentKategori] = 0
      continue
    }

    if (!currentKategori) continue

    // DETEKSI DATA
    const match = line.match(/^([^\d]+)\s*(\d+)\s*([a-zA-Z]*)$/)
    if (!match) continue

    const nama = match[1].trim().toUpperCase()
    const angkaAwal = Number(match[2])
    const huruf = (match[3] || '').toUpperCase()

    const fee = getFee(angkaAwal)
    feeKategori[currentKategori] += fee

    let angkaAkhir
    if (huruf === 'LF') {
      angkaAkhir = angkaAwal - (fee * 2)
    } else if (huruf) {
      angkaAkhir = angkaAwal - fee
    } else {
      angkaAkhir = angkaAwal * 2 - fee
    }

    dataKategori[currentKategori].push({
      nama,
      angkaAwal,
      angkaAkhir,
      huruf
    })
  }

  const kategoriKeys = Object.keys(dataKategori)
  if (kategoriKeys.length < 1)
    return reply('❌ Data tidak valid')

  const formatHasil = (arr) =>
    arr
      .map(v =>
        `${v.nama} ${v.angkaAwal} \\ ${v.angkaAkhir}${v.huruf ? ' ' + v.huruf : ''}`
      )
      .join('\n')

  let output = ''
  let totalFee = 0

  kategoriKeys.forEach(kat => {
    output += `${kat.toUpperCase()}:\n`
    output += (formatHasil(dataKategori[kat]) || '-') + '\n'
    output += `FEE ${kat.toUpperCase()}: ${feeKategori[kat]}\n\n`
    totalFee += feeKategori[kat]
  })

  output += `TOTAL ALL FEE: ${totalFee}`

  reply(output.trim())

break  
    }

case 'kick': {
  try {
    if (!isGroup) return m.reply('⚠️ Hanya bisa di grup!');
    if (!isPremium) return 

    console.log('[CMD] kick dipanggil oleh', m.sender, 'di', m.chat);
    await m.reply('🕐 Memproses perintah kick...');

    // Ambil metadata grup
    const groupMetadata = await xwyrken.groupMetadata(m.chat);
    const participants = groupMetadata?.participants || [];

    // Ambil target
    let users = [];

    // MODE KICK ALL (TANPA FILTER APAPUN)
    if (m.text && /(kick\s+all|kick\s+semua)/i.test(m.text)) {
      users = participants.map(p => p.id);
    }

    // MODE NORMAL
    else {
      if (m.mentionedJid && m.mentionedJid.length) {
        users = m.mentionedJid;
      } else if (m.text && /@(\d{5,16})/g.test(m.text)) {
        users = Array.from(m.text.match(/@(\d{5,16})/g))
          .map(v => v.replace('@', '') + '@s.whatsapp.net');
      } else if (m.quoted && m.quoted.sender) {
        users = [m.quoted.sender];
      }
    }

    // Bersihkan & unikkan
    users = [...new Set(users.filter(Boolean))];

    if (!users.length)
      return m.reply('Tag, reply, atau gunakan `kick all / kick semua`.');

    let success = [];
    let failed = [];

    for (let user of users) {
      try {
        await xwyrken.groupParticipantsUpdate(m.chat, [user], 'remove');
        success.push(user);

        try {
          await xwyrken.sendMessage(m.chat, {
            react: { text: '⚔️', key: m.key }
          });
        } catch {}

        // delay anti rate-limit
        await new Promise(res => setTimeout(res, 1200));
      } catch (e) {
        console.error('[KICK ERROR]', user, e);
        failed.push({ user, reason: e?.message || 'failed' });
      }
    }

    // Ringkasan
    let result = '';
    if (success.length)
      result += `✅ Berhasil: ${success.map(u => '@' + u.split('@')[0]).join(', ')}\n`;
    if (failed.length)
      result += `❌ Gagal: ${failed.map(f => '@' + f.user.split('@')[0]).join(', ')}\n`;

    if (!result) result = 'Tidak ada aksi dilakukan.';

    await xwyrken.sendMessage(m.chat, {
      text: result,
      mentions: [...success, ...failed.map(f => f.user)]
    });

  } catch (err) {
    console.error('[CASE KICK FATAL]', err);
    m.reply('❌ Terjadi error saat menjalankan kick.');
  }
  break;
}
case 'back': {
  if (!isPremium) {
    return xwyrken.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })
  }

  const fs = require('fs')

  const userFile = './database/userdata.json'
  const gameGlobalFile = './all/database/gamehistory.json'
  const gameKKFile = './all/database/gamehistory_kanankiri.json'
  const profitGlobalFile = './all/database/profit.json'
  const profitKKFile = './all/database/profit_kanankiri.json'
  const profitPerakFile = './all/database/profitperak.json'

  const userData = fs.existsSync(userFile)
    ? JSON.parse(fs.readFileSync(userFile))
    : {}

  const gameGlobal = fs.existsSync(gameGlobalFile)
    ? JSON.parse(fs.readFileSync(gameGlobalFile))
    : {}

  const gameKK = fs.existsSync(gameKKFile)
    ? JSON.parse(fs.readFileSync(gameKKFile))
    : {}

  const profitGlobal = fs.existsSync(profitGlobalFile)
    ? JSON.parse(fs.readFileSync(profitGlobalFile))
    : {}

  const profitKK = fs.existsSync(profitKKFile)
    ? JSON.parse(fs.readFileSync(profitKKFile))
    : {}
    
      const profitPerak = fs.existsSync(profitPerakFile)
    ? JSON.parse(fs.readFileSync(profitPerakFile))
    : {}

  const id = sender

  if (!userData[id] || !userData[id].backupSaldo) {
    return reply('❌ Tidak ada game yang bisa di-back')
  }

  /* =====================
     RESTORE SALDO
     ===================== */
  userData[id].saldo = JSON.parse(
    JSON.stringify(userData[id].backupSaldo)
  )

  /* =====================
     ROLLBACK DATA (POP)
     ===================== */
  if (Array.isArray(gameGlobal[id])) gameGlobal[id].pop()
  if (Array.isArray(gameKK[id])) gameKK[id].pop()
  if (Array.isArray(profitGlobal[id])) profitGlobal[id].pop()
  if (Array.isArray(profitKK[id])) profitKK[id].pop()
    if (Array.isArray(profitPerak[id])) profitPerak[id].pop()

  /* =====================
     HAPUS BACKUP
     ===================== */
  delete userData[id].backupSaldo

  /* =====================
     SAVE FILE
     ===================== */
  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))
  fs.writeFileSync(gameGlobalFile, JSON.stringify(gameGlobal, null, 2))
  fs.writeFileSync(gameKKFile, JSON.stringify(gameKK, null, 2))
  fs.writeFileSync(profitGlobalFile, JSON.stringify(profitGlobal, null, 2))
  fs.writeFileSync(profitKKFile, JSON.stringify(profitKK, null, 2))
  fs.writeFileSync(profitPerakFile, JSON.stringify(profitPerak, null, 2))

  await xwyrken.sendMessage(m.chat, {
    react: { text: '✨', key: m.key }
  })
  await xwyrken.sendMessage(m.chat, {
    text: '✅ *Game Berhasil Di Back*\n> Fitur berguna *1x game*'
  })

  break
}

case 'b':
case 'k': {
  if (!isPremium) return 

  const winner = command === 'b' ? 'B' : 'K'
  const skor = args[0]
  if (!skor) return reply('❗ Gunakan: *.k skor* atau *.b skor*')
  if (!m.quoted || !m.quoted.text) return reply("❗Reply pesan berisi data taruhan")

  const fs = require('fs')
  const path = './all/database'
  const userFile = './database/userdata.json'
  const gameLogFile = `${path}/gamehistory.json`
  const infoFile = `${path}/info.json`
  const jancoFile = `${path}/janco.json`
  const lwFile = `${path}/lwinfo.json`
  const profitFile = `${path}/profit.json`
  

  const userData = fs.existsSync(userFile) ? JSON.parse(fs.readFileSync(userFile)) : {}
  const gameLog = fs.existsSync(gameLogFile) ? JSON.parse(fs.readFileSync(gameLogFile)) : {}
  const allInfo = fs.existsSync(infoFile) ? JSON.parse(fs.readFileSync(infoFile)) : {}
  const jancoData = fs.existsSync(jancoFile) ? JSON.parse(fs.readFileSync(jancoFile)) : {}
  const lwData = fs.existsSync(lwFile) ? JSON.parse(fs.readFileSync(lwFile)) : {}
  const profitData = fs.existsSync(profitFile)
  ? JSON.parse(fs.readFileSync(profitFile))
  : {}

  const id = sender
  if (!userData[id]) userData[id] = {}
  userData[id].saldo = userData[id].saldo || {}
  userData[id].pernahLF = userData[id].pernahLF || {}


  const lwText = lwData[id] || 'LW KAMU GADA😂'

  const toSuperscript = (n) => String(n).split('').map(d => '0123456789'['0123456789'.indexOf(d)]).join('')
  const toSubscript = (n) => String(n).split('').map(d => '0123456789'['0123456789'.indexOf(d)]).join('')

    const lines = m.quoted.text.split('\n')
  let current = ''
  let data = { B: [], K: [] }
  
  for (let line of lines) {
    if (/^(b|besar)\s*:?\s*$/i.test(line)) { current = 'B'; continue }
    if (/^(k|kecil)\s*:?\s*$/i.test(line)) { current = 'K'; continue }

    const match = line.trim().match(/^([^\d]+)\s+(\d+)(\w*)$/i)
    if (!match || !current) continue


    let [, nama, angkaStr, huruf] = match
    nama = nama.trim().toUpperCase()
    const angka = parseInt(angkaStr)
    huruf = huruf?.toLowerCase() || ''

    if (huruf === 'lf') {
      userData[id].pernahLF[nama] = true
    }

    data[current].push({ nama, angka, huruf })
  }
userData[id].backupSaldo = JSON.parse(
  JSON.stringify(userData[id].saldo)
)


  const getFee = (n) => {
  if (n <= 9) return 1
  if (n <= 19) return 2
  if (n <= 29) return 3
  if (n <= 39) return 4
  if (n <= 49) return 5
  if (n <= 59) return 6
  if (n <= 69) return 7
  if (n <= 79) return 8
  if (n <= 89) return 9
  if (n <= 99) return 10
  if (n <= 109) return 11
  if (n <= 119) return 12
  if (n <= 129) return 13
  if (n <= 139) return 14
  if (n <= 149) return 15
  if (n <= 159) return 16
  if (n <= 169) return 17
  if (n <= 179) return 18
  if (n <= 189) return 19
  if (n <= 199) return 20
  if (n <= 209) return 21
  if (n <= 219) return 22
  if (n <= 229) return 23
  if (n <= 239) return 24
  if (n <= 249) return 25
  if (n <= 259) return 26
  if (n <= 269) return 27
  if (n <= 279) return 28
  if (n <= 289) return 29
  if (n <= 299) return 30
  if (n <= 309) return 31
  if (n <= 319) return 32
  if (n <= 329) return 33
  if (n <= 339) return 34
  if (n <= 349) return 35
  if (n <= 359) return 36
  if (n <= 369) return 37
  if (n <= 379) return 38
  if (n <= 389) return 39
  if (n <= 399) return 40
  if (n <= 409) return 41
  if (n <= 419) return 42
  if (n <= 429) return 43
  if (n <= 439) return 44
  if (n <= 449) return 45
  if (n <= 459) return 46
  if (n <= 469) return 47
  if (n <= 479) return 48
  if (n <= 489) return 49
  if (n <= 499) return 50
  if (n <= 509) return 51
  if (n <= 519) return 52
  if (n <= 529) return 53
  if (n <= 539) return 54
  if (n <= 549) return 55
  if (n <= 559) return 56
  if (n <= 569) return 57
  if (n <= 579) return 58
  if (n <= 589) return 59
  if (n <= 599) return 60
  if (n <= 609) return 61
  if (n <= 619) return 62
  if (n <= 629) return 63
  if (n <= 639) return 64
  if (n <= 649) return 65
  if (n <= 659) return 66
  if (n <= 669) return 67
  if (n <= 679) return 68
  if (n <= 689) return 69
  if (n <= 699) return 70
  if (n <= 709) return 71
  if (n <= 719) return 72
  if (n <= 729) return 73
  if (n <= 739) return 74
  if (n <= 749) return 75
  if (n <= 759) return 76
  if (n <= 769) return 77
  if (n <= 779) return 78
  if (n <= 789) return 79
  if (n <= 799) return 80
  if (n <= 809) return 81
  if (n <= 819) return 82
  if (n <= 829) return 83
  if (n <= 839) return 84
  if (n <= 849) return 85
  if (n <= 859) return 86
  if (n <= 869) return 87
  if (n <= 879) return 88
  if (n <= 889) return 89
  if (n <= 899) return 90
  if (n <= 909) return 91
  if (n <= 919) return 92
  if (n <= 929) return 93
  if (n <= 939) return 94
  if (n <= 949) return 95
  if (n <= 959) return 96
  if (n <= 969) return 97
  if (n <= 979) return 98
  if (n <= 989) return 99
  if (n <= 999) return 100
  if (n <= 1009) return 102
  if (n <= 1109) return 103
  if (n <= 1119) return 104
  if (n <= 1129) return 105
  if (n <= 1139) return 106
  if (n <= 1149) return 107
  if (n <= 1159) return 108
  if (n <= 1169) return 109
  if (n <= 1179) return 110
  if (n <= 1189) return 111
  if (n <= 1199) return 112
  if (n <= 1209) return 113
  if (n <= 1219) return 114
  if (n <= 1229) return 115
  if (n <= 1239) return 116
  if (n <= 1249) return 117
  if (n <= 1259) return 118
  if (n <= 1269) return 119
  if (n <= 1279) return 120
  if (n <= 1289) return 121
  if (n <= 1299) return 122
  if (n <= 1309) return 123
  if (n <= 1319) return 124
  if (n <= 1329) return 125
  if (n <= 1339) return 126
  if (n <= 1349) return 127
  if (n <= 1359) return 128
  if (n <= 1369) return 129
  if (n <= 1379) return 130
  if (n <= 1389) return 131
  if (n <= 1399) return 132
  if (n <= 1409) return 133
  if (n <= 1419) return 134
  if (n <= 1429) return 135
  if (n <= 1439) return 136
  if (n <= 1449) return 137
  if (n <= 1459) return 138
  if (n <= 1469) return 139
  if (n <= 1479) return 140
  if (n <= 1489) return 141
  if (n <= 1499) return 142
  if (n <= 1509) return 143
  if (n <= 1519) return 144
  if (n <= 1529) return 145
  
  
  
  
  
  

  // di atas 60000 → lanjut nambah 1000 per 10k
  // ambil kelipatan 10000
  const extra = Math.floor((n - 50000) / 10000) + 1
  return 6000 + (extra * 1000)
}

  for (let team of ['B', 'K']) {
    const menang = team === winner
    for (let { nama, angka, huruf } of data[team]) {
      const fee = getFee(angka)
      const sAwal = userData[id].saldo[nama] ?? 0
      let sAkhir = 0

      if (menang) {
        if (huruf === 'lf') {
          sAkhir = sAwal + (angka - fee)
        } else {
          sAkhir = sAwal > 0 ? sAwal + (angka - fee) : angka * 2 - fee
        }
      } else {
        if (huruf === 'lf') {
          sAkhir = sAwal - angka
        } else {
          sAkhir = sAwal - angka
          if (sAwal <= 0) sAkhir = 0
          if (sAkhir < 0) sAkhir = 0
        }
      }

      userData[id].saldo[nama] = sAkhir       
    }
  }

  const totalSkor = data[winner].reduce((sum, obj) => sum + obj.angka, 0)
  const totalFee = data[winner].reduce((sum, obj) => sum + getFee(obj.angka), 0)
  
  if (!profitData[id]) profitData[id] = []

profitData[id].push({
  winner,
  skor: totalSkor,
  fee: totalFee,
  time: Date.now()
})

fs.writeFileSync(profitFile, JSON.stringify(profitData, null, 2))



  jancoData[id] = { n: totalSkor, b: totalFee }
  fs.writeFileSync(jancoFile, JSON.stringify(jancoData, null, 2))
  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))
const ekstra = args[1] ? args.slice(1).join(" ") : ""
  if (!gameLog[id]) gameLog[id] = []
  if (gameLog[id].length < 30000) {
    gameLog[id].push(`${winner} ${skor} (${totalSkor}) ${ekstra}`.trim())
    fs.writeFileSync(gameLogFile, JSON.stringify(gameLog, null, 2))
  }

  await new Promise(r => setTimeout(r, 10))
  await new Promise(r => setTimeout(r, 10))

   const { performance } = require('perf_hooks');
  const os = require('os');
  const moment = require('moment-timezone')
moment.locale('id')

const mentionUser = `@${m.sender.split('@')[0]}`

// HEADER
let out = `${lwText}`.trimEnd()
out += `\n\n*LIST WIN* ${mentionUser}\n`

// GAME HISTORY
if (gameLog[id] && gameLog[id].length) {
  out += gameLog[id]
    .map((v, i) => {
      const boldKurung = v.replace(/\(([^)]+)\)/g, '*($1)*')

      // ubah B / K jadi BESAR / KECIL
      let label = ''
      if (boldKurung.startsWith('B ')) label = 'BESAR'
      else if (boldKurung.startsWith('K ')) label = 'KECIL'

      const isi = boldKurung.replace(/^[BK]\s+/, `${label} `)

      return `*GAME ${i + 1}* : ${isi}`
    })
    .join('\n')
} else {
  out += 'BELUM ADA GAME'
}


// ================= TOTAL SALDO =================
const semuaNama = Object.entries(userData[id].saldo)

let totalSaldo = 0
let totalUtang = 0

// SORT SALDO BESAR → KECIL
const saldoSorted = semuaNama
  .filter(([_, saldo]) => saldo > 0)
  .sort((a, b) => b[1] - a[1])

// SORT UTANG BESAR → KECIL (nilai mutlak)
const utangSorted = semuaNama
  .filter(([nama, saldo]) => saldo < 0 && userData[id].pernahLF?.[nama])
  .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))

const saldoList = []
const utangList = []

for (let i = 0; i < saldoSorted.length; i++) {
  const [nama, saldo] = saldoSorted[i]
  totalSaldo += saldo

  const mahkota = i === 0 ? '👑' : ''
  saldoList.push(`${nama} *${saldo}*${mahkota}`)
}

for (const [nama, saldo] of utangSorted) {
  totalUtang += saldo
  utangList.push(`${nama} *${saldo}*🩲`)
}

// ===== SALDO =====
out += `\n\nSALDO MAFIA : (*${totalSaldo}*)\n`
out += saldoList.length ? saldoList.join('\n') : '0'

// ===== UTANG (muncul kalau ada aja) =====
if (utangList.length) {
  out += `\n\nUTANG : (*${totalUtang}*)\n`
  out += utangList.join('\n')
}

await xwyrken.sendMessage(m.chat, { 
  text: out,
  mentions: [m.sender]
})
break
}

case 's': {
  if (!isPremium)
    return xwyrken.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })

  const fs = require('fs')
  const userFile = './database/userdata.json'
  const userData = fs.existsSync(userFile)
    ? JSON.parse(fs.readFileSync(userFile))
    : {}

  const id = sender

  // kalau data kosong
  if (!userData[id] || !userData[id].saldo) {
    return xwyrken.sendMessage(m.chat, {
      text: '*SALDO MAFIA:*\n(0)'
    })
  }

  const saldoData = userData[id].saldo || {}
  const pernahLF = userData[id].pernahLF || {}

  // ===== SORT DATA =====
  const entries = Object.entries(saldoData)

  const atmSorted = entries
    .filter(([_, saldo]) => saldo > 0)
    .sort((a, b) => b[1] - a[1]) // terbesar ke kecil

  const pinjolSorted = entries
    .filter(([nama, saldo]) => saldo < 0 && pernahLF[nama])
    .sort((a, b) => a[1] - b[1]) // utang terbesar di atas

  let totalAtm = atmSorted.reduce((a, [_, v]) => a + v, 0)
  let totalPinjol = pinjolSorted.reduce((a, [_, v]) => a + v, 0)

  // ===== SALDO TEXT =====
  let atmList = '(0)'
  if (atmSorted.length) {
    atmList = atmSorted.map(([n, v], i) => {
      const crown = i === 0 ? '👑' : ''
      return `${n.toUpperCase()} *${v}*${crown}`
    }).join('\n')
  }

  let result =
`*SALDO MAFIA (${totalAtm}):*
${atmList}`

  // ===== UTANG TEXT =====
  if (pinjolSorted.length) {
    const pinjolList = pinjolSorted.map(([n, v]) => {
      return `${n.toUpperCase()} *${v}*🩲`
    }).join('\n')

    result +=
`\n\n*UTANG (${totalPinjol}):*
${pinjolList}`
  }

  await xwyrken.sendMessage(m.chat, { text: result })
  break
}

case 'wk':
case 'wb': {
  if (!isPremium) return 

  const winner = command === 'wb' ? 'B' : 'K'
  const skor = args[0]
  if (!skor) return reply('❗ Gunakan: *.wk skor* atau *.wb skor*')
  if (!m.quoted || !m.quoted.text) return reply("❗Reply pesan berisi data taruhan")

  const fs = require('fs')
  const path = './all/database'
  const userFile = './database/userdata.json'
  const gameLogFile = `${path}/gamehistory.json`
  const infoFile = `${path}/info.json`
  const jancoFile = `${path}/janco.json`
  const lwFile = `${path}/lwinfo.json`
  const profitPerakFile = `${path}/profitperak.json`
  

  const userData = fs.existsSync(userFile) ? JSON.parse(fs.readFileSync(userFile)) : {}
  const gameLog = fs.existsSync(gameLogFile) ? JSON.parse(fs.readFileSync(gameLogFile)) : {}
  const allInfo = fs.existsSync(infoFile) ? JSON.parse(fs.readFileSync(infoFile)) : {}
  const jancoData = fs.existsSync(jancoFile) ? JSON.parse(fs.readFileSync(jancoFile)) : {}
  const lwData = fs.existsSync(lwFile) ? JSON.parse(fs.readFileSync(lwFile)) : {}
  const profitMemori = fs.existsSync(profitPerakFile)
  ? JSON.parse(fs.readFileSync(profitPerakFile))
  : {}
  

  const id = sender
  if (!userData[id]) userData[id] = {}
  userData[id].saldo = userData[id].saldo || {}
  userData[id].pernahLF = userData[id].pernahLF || {}


  const lwText = lwData[id] || 'LW KAMU GADA😂'

  const toSuperscript = (n) => String(n).split('').map(d => '0123456789'['0123456789'.indexOf(d)]).join('')
  const toSubscript = (n) => String(n).split('').map(d => '0123456789'['0123456789'.indexOf(d)]).join('')

    const lines = m.quoted.text.split('\n')
  let current = ''
  let data = { B: [], K: [] }
  
  for (let line of lines) {
    if (/^(b|besar)\s*:?\s*$/i.test(line)) { current = 'B'; continue }
    if (/^(k|kecil)\s*:?\s*$/i.test(line)) { current = 'K'; continue }

    const match = line.trim().match(/^([^\d]+)\s+(\d+)(\w*)$/i)
    if (!match || !current) continue


    let [, nama, angkaStr, huruf] = match
    nama = nama.trim().toUpperCase()
    const angka = parseInt(angkaStr)
    huruf = huruf?.toLowerCase() || ''

    if (huruf === 'lf') {
      userData[id].pernahLF[nama] = true
    }

    data[current].push({ nama, angka, huruf })
  }
userData[id].backupSaldo = JSON.parse(
  JSON.stringify(userData[id].saldo)
)
const getFee = (n) => {

  if (n >= 100 && n <= 300) return 90
  if (n >= 301 && n <= 500) return 280
  if (n >= 501 && n <= 900) return 390
  if (n >= 1000 && n <= 1900) return 499

  if (n >= 2000 && n <= 2900) return 650
  if (n >= 3000 && n <= 3900) return 800
  if (n >= 4000 && n <= 4900) return 950
  if (n >= 5000 && n <= 5900) return 1100
  if (n >= 6000 && n <= 6900) return 1250

  if (n >= 7000 && n <= 7900) return 1350
  if (n >= 8000 && n <= 8900) return 1450
  if (n >= 9000 && n <= 9900) return 1550

  if (n >= 10000) {
    const step = Math.floor((n - 10000) / 10000)
    return 2100 + (step * 1100)
  }

  return 0
}


  for (let team of ['B', 'K']) {
    const menang = team === winner
    for (let { nama, angka, huruf } of data[team]) {
      const fee = getFee(angka)
      const sAwal = userData[id].saldo[nama] ?? 0
      let sAkhir = 0

      if (menang) {
        if (huruf === 'lf') {
          sAkhir = sAwal + (angka - fee)
        } else {
          sAkhir = sAwal > 0 ? sAwal + (angka - fee) : angka * 2 - fee
        }
      } else {
        if (huruf === 'lf') {
          sAkhir = sAwal - angka
        } else {
          sAkhir = sAwal - angka
          if (sAwal <= 0) sAkhir = 0
          if (sAkhir < 0) sAkhir = 0
        }
      }

      userData[id].saldo[nama] = sAkhir       
    }
  }

  const totalSkor = data[winner].reduce((sum, obj) => sum + obj.angka, 0)
  const totalFee = data[winner].reduce((sum, obj) => sum + getFee(obj.angka), 0)
  
  if (!profitMemori[id]) profitMemori[id] = []

profitMemori[id].push({
  winner,
  skor: totalSkor,
  fee: totalFee,
  time: Date.now()
})

fs.writeFileSync(profitPerakFile, JSON.stringify(profitMemori, null, 2))



  jancoData[id] = { n: totalSkor, b: totalFee }
  fs.writeFileSync(jancoFile, JSON.stringify(jancoData, null, 2))
  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))
const ekstra = args[1] ? args.slice(1).join(" ") : ""
  if (!gameLog[id]) gameLog[id] = []
  if (gameLog[id].length < 30000) {
    gameLog[id].push(`${winner} ${skor} (${totalSkor}) ${ekstra}`.trim())
    fs.writeFileSync(gameLogFile, JSON.stringify(gameLog, null, 2))
  }

  await new Promise(r => setTimeout(r, 10))
  await new Promise(r => setTimeout(r, 10))

   const { performance } = require('perf_hooks');
  const os = require('os');
  const moment = require('moment-timezone')
moment.locale('id')

const mentionUser = `@${m.sender.split('@')[0]}`

// HEADER
let out = `${lwText}`.trimEnd()
out += `\n\n*LIST WIN* ${mentionUser}\n`

// GAME HISTORY
if (gameLog[id] && gameLog[id].length) {
  out += gameLog[id]
    .map((v, i) => {
      const boldKurung = v.replace(/\(([^)]+)\)/g, '*($1)*')

      // ubah B / K jadi BESAR / KECIL
      let label = ''
      if (boldKurung.startsWith('B ')) label = 'BESAR'
      else if (boldKurung.startsWith('K ')) label = 'KECIL'

      const isi = boldKurung.replace(/^[BK]\s+/, `${label} `)

      return `*GAME ${i + 1}* : ${isi}`
    })
    .join('\n')
} else {
  out += 'BELUM ADA GAME'
}


// ================= TOTAL SALDO =================
const semuaNama = Object.entries(userData[id].saldo)

let totalSaldo = 0
let totalUtang = 0

// SORT SALDO BESAR → KECIL
const saldoSorted = semuaNama
  .filter(([_, saldo]) => saldo > 0)
  .sort((a, b) => b[1] - a[1])

// SORT UTANG BESAR → KECIL (nilai mutlak)
const utangSorted = semuaNama
  .filter(([nama, saldo]) => saldo < 0 && userData[id].pernahLF?.[nama])
  .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))

const saldoList = []
const utangList = []

for (let i = 0; i < saldoSorted.length; i++) {
  const [nama, saldo] = saldoSorted[i]
  totalSaldo += saldo

  const mahkota = i === 0 ? '👑' : ''
  saldoList.push(`${nama} *${saldo}*${mahkota}`)
}

for (const [nama, saldo] of utangSorted) {
  totalUtang += saldo
  utangList.push(`${nama} *${saldo}*🩲`)
}


// ===== SALDO =====
out += `\n\nSALDO MAFIA : *(${totalSaldo})*\n`
out += saldoList.length ? saldoList.join('\n') : '0'

// ===== UTANG (muncul kalau ada aja) =====
if (utangList.length) {
  out += `\n\nUTANG : *(${totalUtang})*\n`
  out += utangList.join('\n')
}

await xwyrken.sendMessage(m.chat, { 
  text: out,
  mentions: [m.sender]
})
break
}   
case 'winkanan':
case 'winkiri': {
  if (!isPremium) return xwyrken.sendMessage(m.chat, {
    react: { text: `😼`, key: m.key }
  })

  const winner = command === 'winkanan' ? 'KANAN' : 'KIRI'
  const hasil = args[0]
if (!hasil || !/^\d+-\d+$/.test(hasil))
  return reply('❗ Gunakan: *.winkanan 2-0* atau *.winkiri 2-1*')

const [skorA, skorB] = hasil.split('-').map(Number)

  const fs = require('fs')
  const path = './all/database'
  const userFile = './database/userdata.json'
  const infoFile = `${path}/info.json`
  const jancoFile = `${path}/janco.json`
  const lwFile = `${path}/lwinfo.json`
const gameLogFile = `${path}/gamehistory_kanankiri.json`
const profitFile = `${path}/profit_kanankiri.json`

  const userData = fs.existsSync(userFile) ? JSON.parse(fs.readFileSync(userFile)) : {}
  const gameLog = fs.existsSync(gameLogFile) ? JSON.parse(fs.readFileSync(gameLogFile)) : {}
  const allInfo = fs.existsSync(infoFile) ? JSON.parse(fs.readFileSync(infoFile)) : {}
  const jancoData = fs.existsSync(jancoFile) ? JSON.parse(fs.readFileSync(jancoFile)) : {}
  const lwData = fs.existsSync(lwFile) ? JSON.parse(fs.readFileSync(lwFile)) : {}
  const profitData = fs.existsSync(profitFile)
  ? JSON.parse(fs.readFileSync(profitFile))
  : {}

  const id = sender
  if (!userData[id]) userData[id] = {}
  userData[id].saldo = userData[id].saldo || {}
  userData[id].pernahLF = userData[id].pernahLF || {}


  const lwText = lwData[id] || 'LW KAMU GADA😂'

  const toSuperscript = (n) => String(n).split('').map(d => '0123456789'['0123456789'.indexOf(d)]).join('')
  const toSubscript = (n) => String(n).split('').map(d => '0123456789'['0123456789'.indexOf(d)]).join('')

    const lines = m.quoted.text.split('\n')
let current = ''
let data = { KANAN: [], KIRI: [] }

for (let line of lines) {

  if (/^(kanan)\s*:?\s*$/i.test(line)) {
    current = 'KANAN'
    continue
  }

  if (/^(kiri)\s*:?\s*$/i.test(line)) {
    current = 'KIRI'
    continue
  }

  const match = line.trim().match(/^([^\d]+)\s+(\d+)(\w*)$/i)
  if (!match || !current) continue
    let [, nama, angkaStr, huruf] = match
    nama = nama.trim().toUpperCase()
    const angka = parseInt(angkaStr)
    huruf = huruf?.toLowerCase() || ''

    if (huruf === 'lf') {
      userData[id].pernahLF[nama] = true
    }

    data[current].push({ nama, angka, huruf })
  }
userData[id].backupSaldo = JSON.parse(
  JSON.stringify(userData[id].saldo)
)


  const getFee = (n) => {
  if (n <= 9) return 1
  if (n <= 19) return 2
  if (n <= 29) return 3
  if (n <= 39) return 4
  if (n <= 49) return 5
  if (n <= 59) return 6
  if (n <= 69) return 7
  if (n <= 79) return 8
  if (n <= 89) return 9
  if (n <= 99) return 10
  if (n <= 109) return 11
  if (n <= 119) return 12
  if (n <= 129) return 13
  if (n <= 139) return 14
  if (n <= 149) return 15
  if (n <= 159) return 16
  if (n <= 169) return 17
  if (n <= 179) return 18
  if (n <= 189) return 19
  if (n <= 199) return 20
  if (n <= 209) return 21
  if (n <= 219) return 22
  if (n <= 229) return 23
  if (n <= 239) return 24
  if (n <= 249) return 25
  if (n <= 259) return 26
  if (n <= 269) return 27
  if (n <= 279) return 28
  if (n <= 289) return 29
  if (n <= 299) return 30
  if (n <= 309) return 31
  if (n <= 319) return 32
  if (n <= 329) return 33
  if (n <= 339) return 34
  if (n <= 349) return 35
  if (n <= 359) return 36
  if (n <= 369) return 37
  if (n <= 379) return 38
  if (n <= 389) return 39
  if (n <= 399) return 40
  if (n <= 409) return 41
  if (n <= 419) return 42
  if (n <= 429) return 43
  if (n <= 439) return 44
  if (n <= 449) return 45
  if (n <= 459) return 46
  if (n <= 469) return 47
  if (n <= 479) return 48
  if (n <= 489) return 49
  if (n <= 499) return 50
  if (n <= 509) return 51
  if (n <= 519) return 52
  if (n <= 529) return 53
  if (n <= 539) return 54
  if (n <= 549) return 55
  if (n <= 559) return 56
  if (n <= 569) return 57
  if (n <= 579) return 58
  if (n <= 589) return 59
  if (n <= 599) return 60
  if (n <= 609) return 61
  if (n <= 619) return 62
  if (n <= 629) return 63
  if (n <= 639) return 64
  if (n <= 649) return 65
  if (n <= 659) return 66
  if (n <= 669) return 67
  if (n <= 679) return 68
  if (n <= 689) return 69
  if (n <= 699) return 70
  if (n <= 709) return 71
  if (n <= 719) return 72
  if (n <= 729) return 73
  if (n <= 739) return 74
  if (n <= 749) return 75
  if (n <= 759) return 76
  if (n <= 769) return 77
  if (n <= 779) return 78
  if (n <= 789) return 79
  if (n <= 799) return 80
  if (n <= 809) return 81
  if (n <= 819) return 82
  if (n <= 829) return 83
  if (n <= 839) return 84
  if (n <= 849) return 85
  if (n <= 859) return 86
  if (n <= 869) return 87
  if (n <= 879) return 88
  if (n <= 889) return 89
  if (n <= 899) return 90
  if (n <= 909) return 91
  if (n <= 919) return 92
  if (n <= 929) return 93
  if (n <= 939) return 94
  if (n <= 949) return 95
  if (n <= 959) return 96
  if (n <= 969) return 97
  if (n <= 979) return 98
  if (n <= 989) return 99
  if (n <= 999) return 100
  if (n <= 1009) return 102
  if (n <= 1109) return 103
  if (n <= 1119) return 104
  if (n <= 1129) return 105
  if (n <= 1139) return 106
  if (n <= 1149) return 107
  if (n <= 1159) return 108
  if (n <= 1169) return 109
  if (n <= 1179) return 110
  if (n <= 1189) return 111
  if (n <= 1199) return 112
  if (n <= 1209) return 113
  if (n <= 1219) return 114
  if (n <= 1229) return 115
  if (n <= 1239) return 116
  if (n <= 1249) return 117
  if (n <= 1259) return 118
  if (n <= 1269) return 119
  if (n <= 1279) return 120
  if (n <= 1289) return 121
  if (n <= 1299) return 122
  if (n <= 1309) return 123
  if (n <= 1319) return 124
  if (n <= 1329) return 125
  if (n <= 1339) return 126
  if (n <= 1349) return 127
  if (n <= 1359) return 128
  if (n <= 1369) return 129
  if (n <= 1379) return 130
  if (n <= 1389) return 131
  if (n <= 1399) return 132
  if (n <= 1409) return 133
  if (n <= 1419) return 134
  if (n <= 1429) return 135
  if (n <= 1439) return 136
  if (n <= 1449) return 137
  if (n <= 1459) return 138
  if (n <= 1469) return 139
  if (n <= 1479) return 140
  if (n <= 1489) return 141
  if (n <= 1499) return 142
  if (n <= 1509) return 143
  if (n <= 1519) return 144
  if (n <= 1529) return 145
  
  
  
  
  
  

  // di atas 60000 → lanjut nambah 1000 per 10k
  // ambil kelipatan 10000
  const extra = Math.floor((n - 50000) / 10000) + 1
  return 6000 + (extra * 1000)
}
  for (let team of ['KANAN', 'KIRI']) {
    const menang = team === winner
    for (let { nama, angka, huruf } of data[team]) {
      const fee = getFee(angka)
      const sAwal = userData[id].saldo[nama] ?? 0
      let sAkhir = 0

      if (menang) {
        if (huruf === 'lf') {
          sAkhir = sAwal + (angka - fee)
        } else {
          sAkhir = sAwal > 0 ? sAwal + (angka - fee) : angka * 2 - fee
        }
      } else {
        if (huruf === 'lf') {
          sAkhir = sAwal - angka
        } else {
          sAkhir = sAwal - angka
          if (sAwal <= 0) sAkhir = 0
          if (sAkhir < 0) sAkhir = 0
        }
      }

      userData[id].saldo[nama] = sAkhir
    }
  }
    
if (!data?.KANAN?.length && !data?.KIRI?.length)
  return reply('❗ Data taruhan kosong')
  const totalSkor = (data[winner] || []).reduce((sum, obj) => sum + obj.angka, 0)
  const totalFee = (data[winner] || []).reduce((sum, obj) => sum + getFee(obj.angka), 0)
  
  if (!profitData[id]) profitData[id] = []

profitData[id].push({
  winner: winner,
  hasil,              // "2-0" / "2-1"
  skor: totalSkor,
  fee: totalFee,
  time: Date.now()
})

fs.writeFileSync(profitFile, JSON.stringify(profitData, null, 2))

  jancoData[id] = { n: totalSkor, b: totalFee }
  fs.writeFileSync(jancoFile, JSON.stringify(jancoData, null, 2))
  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))
const ekstra = args[1] ? args.slice(1).join(" ") : ""

if (!gameLog[id]) gameLog[id] = []
if (gameLog[id].length < 30000) {
  gameLog[id].push(
    `${winner} ${hasil} (${totalSkor})${ekstra ? ' ' + ekstra : ''}`
  )
}

fs.writeFileSync(gameLogFile, JSON.stringify(gameLog, null, 2))

   const { performance } = require('perf_hooks');
  const os = require('os');
  const moment = require('moment-timezone');

  const old = performance.now();
  const speed = (performance.now() - old).toFixed(0);
  const uptime = process.uptime();

  moment.locale('id')
const mentionUser = `@${m.sender.split('@')[0]}`
  const formatRuntime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs} jam ${mins} menit`;
  };


  const used = process.memoryUsage();
  const ram = (used.heapUsed / 1024 / 1024).toFixed(2);
let out = `${lwText}`.trimEnd()
out += `\n\n*LIST WIN* ${mentionUser}\n` +
  gameLog[id]
    .map((v, i) => `*GAME ${i + 1} : ${v}*`)
    .join('\n');

   const semuaNama = Object.entries(userData[id].saldo)
const saldoSorted = semuaNama
  .filter(([_, saldo]) => saldo > 0)
  .sort((a, b) => b[1] - a[1])

let totalSaldo = 0
const positif = saldoSorted.map(([nama, saldo], i) => {
  totalSaldo += saldo
  const mahkota = i === 0 ? ' 👑' : ''
  return `${nama} *${saldo}*${mahkota}`
})
const utangSorted = semuaNama
  .filter(([nama, saldo]) => saldo < 0 && userData[id].pernahLF?.[nama])
  .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))

let totalUtang = 0
const negatif = utangSorted.map(([nama, saldo], i) => {
  totalUtang += saldo
  const skull = i === 0 ? ' 😹' : ''
  return `${nama} *${saldo}*${skull}`
})

if (positif.length) {
  out += `\n\n*SALDO MAFIA:* (*${totalSaldo}*)\n`
  out += positif.join('\n')
}
if (negatif.length) {
  out += `\n\n*UTANG:* (*${totalUtang}*)\n`
  out += negatif.join('\n')
}
await xwyrken.sendMessage(m.chat, { 
  text: out,
  mentions: [m.sender]
})
break
}


break
case 'masuk': {
  if (sender !== '62895413124456@s.whatsapp.net') return reply('❌ Khusus owner.')

  if (!args[0]) return reply('⚠️ Kirim link undangan grup!\nContoh: *.masuk https://chat.whatsapp.com/xxxx*')

  const link = args[0]
  const match = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/)
  if (!match) return reply('⚠️ Link undangan tidak valid.')

  const idgb = match[1]  // <== INI dia "idgb" yang kamu maksud

  await xwyrken.groupAcceptInvite(idgb)
  reply('✅ Berhasil masuk ke grup.')
    break
}
case 'hasil': {
  if (!isPremium) return

  const fs = require('fs')
  const path = './all/database'
  const id = sender

  const sources = [
    { file: `${path}/profit.json`, label: '*KECIL–BESAR*' },
    { file: `${path}/profit_kanankiri.json`, label: '*KANAN–KIRI*' },
    { file: `${path}/profitperak.json`, label: '*KB PERAK*' }
  ]

  let out = ''
  let adaData = false

  for (const src of sources) {
    if (!fs.existsSync(src.file)) continue

    const data = JSON.parse(fs.readFileSync(src.file))

    if (!data[id] || !Array.isArray(data[id]) || data[id].length === 0) continue

    const feeList = data[id]
      .map(v => Number(v.fee) || 0)
      .filter(v => v > 0)

    if (feeList.length === 0) continue

    adaData = true

    const totalFee = feeList.reduce((a, b) => a + b, 0)
    const feeText = feeList.map(v => `${v}K`).join(' • ')

    out +=
`──⟢ GAJIAN: @${m.sender.split('@')[0]}
${feeText}
──⟢
TOTAL GAJI: *${totalFee}K*
GAJI OPEN ${src.label}

`
  }

  if (!adaData) {
    return reply('BELUM DAPET 😂')
  }

  await xwyrken.sendMessage(m.chat, {
    text: out.trim(),
    mentions: [m.sender]
  }, { quoted: m })

  break
}


case 'fe': {
  if (!isPremium)
    return xwyrken.sendMessage(m.chat, { react: { text: '❌', key: m.key } })

  // wajib reply pesan
  if (!m.quoted || !m.quoted.text)
    return m.reply('❌ Reply pesan yang ada list fee nya!')

  const lines = m.quoted.text.split('\n')
  const feeList = []
  let totalFee = 0

  // ===== MAP ANGKA =====
  const superMap = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
  }

  const subMap = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
  }

  const normalize = (str) =>
    str
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => superMap[c])
      .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => subMap[c])
      .replace(/[.,]/g, '')

  // ===== PARSE SETIAP BARIS =====
  for (let line of lines) {
    line = line.trim()

    // ambil semua angka setelah "/"
    const matches = line.match(/\/\s*([0-9⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉.,]+)/g)
    if (!matches) continue

    for (const part of matches) {
      let raw = part.replace(/[^0-9⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉.,]/g, '')
      raw = normalize(raw)

      const angka = parseInt(raw)
      if (!isNaN(angka)) {
        feeList.push(angka)
        totalFee += angka
      }
    }
  }

  if (!feeList.length)
    return m.reply('❌ Ga nemu angka valid setelah "/"')

  // ===== FORMAT WAKTU =====
  const now = new Date()
  const tanggal = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  })
  const jam = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta'
  })

  // ===== OUTPUT =====
  let output = `💸 *TOTAL FEE TERKUMPUL*\n`
  output += `🕒 ${tanggal} • ${jam} WIB\n\n`
  output += `📋 *DETAIL:* ${feeList.join(' + ')} = *${totalFee}*\n\n`
  output += `✨ _Kerja bagus bang!_`

  m.reply(output)
  break
}
      
break
case 'out': {
  const allowedOwner = '62895413124456@s.whatsapp.net'
  if (sender !== allowedOwner) return reply('❌ Khusus owner.')

  if (isGroup) return reply('⚠️ Hanya bisa dijalankan di private chat.')

  const idgrup = args[0]
  if (!idgrup || !idgrup.endsWith('@g.us')) {
    return reply('⚠️ Format salah!\nContoh: *.out 1203xxxxx@g.us*')
  }

  try {
    await xwyrken.groupLeave(idgrup)
    reply(`✅ Berhasil keluar dari grup:\n${idgrup}`)
  } catch (e) {
    reply('❌ Gagal keluar dari grup. Mungkin ID grup salah atau bot bukan member.')
  }
}
break
case 'cl': {
  if (!isPremium)
    return xwyrken.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })

  const fs = require('fs')

  const userFile = './database/userdata.json'

  // K / B
  const gameKBFile = './all/database/gamehistory.json'
  const profitKBFile = './all/database/profit.json'
  
  //perak profit
  const profitPPFile= './all/database/profitperak.json'

  // KANAN / KIRI
  const gameKKFile = './all/database/gamehistory_kanankiri.json'
  const profitKKFile = './all/database/profit_kanankiri.json'

  const userData = fs.existsSync(userFile)
    ? JSON.parse(fs.readFileSync(userFile))
    : {}

  const gameKB = fs.existsSync(gameKBFile)
    ? JSON.parse(fs.readFileSync(gameKBFile))
    : {}

  const profitKB = fs.existsSync(profitKBFile)
    ? JSON.parse(fs.readFileSync(profitKBFile))
    : {}
    
      const profitPP = fs.existsSync(profitPPFile)
    ? JSON.parse(fs.readFileSync(profitPPFile))
    : {}

  const gameKK = fs.existsSync(gameKKFile)
    ? JSON.parse(fs.readFileSync(gameKKFile))
    : {}

  const profitKK = fs.existsSync(profitKKFile)
    ? JSON.parse(fs.readFileSync(profitKKFile))
    : {}

  // ===== CLEAR DATA =====

  // saldo mafia & utang (AMAN: cuma reset field)
  if (userData[sender]) {
    userData[sender].saldo = 0
    userData[sender].utang = 0
  }

  // game history
  delete gameKB[sender]
  delete profitKB[sender]
  delete profitPP[sender]

  delete gameKK[sender]
  delete profitKK[sender]

  // ===== SAVE =====
  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))
  fs.writeFileSync(gameKBFile, JSON.stringify(gameKB, null, 2))
  fs.writeFileSync(profitKBFile, JSON.stringify(profitKB, null, 2))
  fs.writeFileSync(gameKKFile, JSON.stringify(gameKK, null, 2))
  fs.writeFileSync(profitKKFile, JSON.stringify(profitKK, null, 2))
    fs.writeFileSync(profitPPFile, JSON.stringify(profitPP, null, 2))

  // ===== SUCCESS REACT =====
  await xwyrken.sendMessage(m.chat, {
    react: { text: '✅', key: m.key }
  })

  break
}
case 'buka': {
  if (!isPremium) return xwyrken.sendMessage(m.chat, { react: { text: `❌`, key: m.key }})
  if (!isGroup) return

  const groupMetadata = await xwyrken.groupMetadata(from)
  const botNumber = xwyrken.user.id.split(':')[0] + '@s.whatsapp.net'
  const isBotAdmin = groupMetadata.participants.find(p => p.jid === botNumber)?.admin

  if (!isBotAdmin) return
  await xwyrken.groupSettingUpdate(from, 'not_announcement')
  await xwyrken.sendMessage(from, { react: { text: '🔓', key: m.key } })
}
break
case 'kurang': {
  if (!isPremium) return

  const nama = args[0]?.toUpperCase()
  const jumlah = parseInt(args[1])
  if (!nama || isNaN(jumlah)) return

  const fs = require('fs')
  const userFile = './database/userdata.json'
  const userData = fs.existsSync(userFile)
    ? JSON.parse(fs.readFileSync(userFile))
    : {}

  const id = sender
  if (!userData[id]) userData[id] = {}
  if (!userData[id].saldo) userData[id].saldo = {}

  const saldoSebelumnya = userData[id].saldo[nama] || 0
  const saldoSekarang = saldoSebelumnya - jumlah

  userData[id].saldo[nama] = saldoSekarang

  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))

  const hasil = `—͟͟͞͞➞◆ Kurang Saldo Berhasil.
𖤍 Pemain: *${nama}*
𖤍 Saldo Sebelumnya: *${saldoSebelumnya}*
𖤍 Saldo Saat Ini: *${saldoSekarang}*
> ketik *.lw* untuk melihat perubahan.`

  await xwyrken.sendMessage(from, { text: hasil })
  break
}
case 'depo': {
  if (!isPremium)
    return xwyrken.sendMessage(m.chat, {
      react: { text: `😂`, key: m.key }
    })

  if (!args.length)
    return reply('❗ Format salah.\nContoh: .depo Cakra 38')

  const jumlah = parseInt(args[args.length - 1])
  if (isNaN(jumlah) || jumlah <= 0)
    return reply('❗ Jumlah harus angka lebih dari 0.')

  const nama = args.slice(0, -1).join(' ').trim().toUpperCase()
  if (!nama)
    return reply('❗ Nama tidak boleh kosong!')

  const fs = require('fs')
  const userFile = './database/userdata.json'
  const userData = fs.existsSync(userFile)
    ? JSON.parse(fs.readFileSync(userFile))
    : {}

  const id = sender
  if (!userData[id]) userData[id] = {}
  if (!userData[id].saldo) userData[id].saldo = {}

  // ===== SALDO SEBELUM =====
  const saldoLama = userData[id].saldo[nama] || 0

  // ===== UPDATE SALDO =====
  const saldoBaru = saldoLama + jumlah
  userData[id].saldo[nama] = saldoBaru

  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))

  // ===== OUTPUT =====
  const pesan =
`⋆.Deposit Berhasil⋆.˚
❀ Pemain: *${nama}*
❀ Jumlah: *+${jumlah}*
❀ Saldo: *${saldoBaru}*
> _ketik *.lw* untuk melihat perubahan._`

  await xwyrken.sendMessage(m.chat, { text: pesan })
  break
}
case 'geser': {
  if (!isPremium)
    return xwyrken.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })

  const [dariRaw, keRaw, jumlahStr] = args
  if (!dariRaw || !keRaw || !jumlahStr)
    return reply('❗ Format: .geser chulo iza 100')

  const dari = dariRaw.trim().toUpperCase()
  const ke = keRaw.trim().toUpperCase()
  const jumlah = parseInt(jumlahStr)

  if (isNaN(jumlah) || jumlah <= 0)
    return reply('❗ Jumlah tidak valid.')

  const fs = require('fs')
  const userFile = './database/userdata.json'
  const userData = fs.existsSync(userFile)
    ? JSON.parse(fs.readFileSync(userFile))
    : {}

  const id = sender

  if (!userData[id]) userData[id] = {}
  if (!userData[id].saldo) userData[id].saldo = {}

  const saldoPengirim = userData[id].saldo[dari] || 0
  if (saldoPengirim < jumlah)
    return reply(`❌ Saldo ${dari} tidak cukup.`)

  // PROSES GESER
  userData[id].saldo[dari] -= jumlah
  userData[id].saldo[ke] = (userData[id].saldo[ke] || 0) + jumlah

  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))

  const saldoAkhirPengirim = userData[id].saldo[dari]

  const hasil = `⋆.˚Geser Berhasil⋆.˚
❀ Dari: *${dari}*
❀ Ke: *${ke}*
❀ Jumlah: *+${jumlah}*
❀ Sisa Saldo ${dari}: *${saldoAkhirPengirim}*
> _ketik *.lw* untuk melihat perubahan._`

  await xwyrken.sendMessage(from, { text: hasil }, { quoted: m })
    break
}

case 'dgs': {
  if (!isPremium) {
    await xwyrken.sendMessage(m.chat, {
      react: { text: '😂', key: m.key }
    })
    break
  }

  const fs = require('fs')
  const userFile = './database/userdata.json'
  const userData = fs.existsSync(userFile)
    ? JSON.parse(fs.readFileSync(userFile))
    : {}

  const id = sender
  if (!userData[id]) userData[id] = {}
  if (!userData[id].saldo) userData[id].saldo = {}

  // =============================
  // PARSE INPUT (TEXT / REPLY)
  // =============================
  let rawText = ''

  if (m.quoted && m.quoted.text) {
    rawText = m.quoted.text
  } else {
    rawText = m.text.replace(/^\.dgs\s*/i, '')
  }

  if (!rawText.trim()) {
    await xwyrken.sendMessage(m.chat, {
      text: '❗ Format:\n.dgs\nnama jumlah\n\nAtau reply pesan:\nnama jumlah'
    })
    break
  }

  const lines = rawText.split('\n')

  let jumlahPemain = 0
  let totalMafia = 0
  let totalUtang = 0

  for (let line of lines) {
    line = line.trim()
    if (!line) continue

    const parts = line.split(' ')
    const jumlah = parseInt(parts.pop())
    const nama = parts.join(' ').toUpperCase()

    if (!nama || isNaN(jumlah)) continue

    const saldoLama = userData[id].saldo[nama] || 0
    const saldoBaru = saldoLama + jumlah

    userData[id].saldo[nama] = saldoBaru
    jumlahPemain++

    if (saldoBaru < 0) {
      totalUtang += saldoBaru // tetap negatif
    } else {
      totalMafia += saldoBaru
    }
  }

  fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))

  if (jumlahPemain === 0) {
    await xwyrken.sendMessage(m.chat, {
      text: '❌ Tidak ada data valid.'
    })
    break
  }

  // =============================
  // OUTPUT
  // =============================
  let pesan =
`⋆.˚Geseran Berhasil⋆.˚
𖤍 Jumlah Pemain: *${jumlahPemain}*
𖤍 Saldo Mafia: *${totalMafia}*`

  if (totalUtang !== 0) {
    pesan += `\n𖤍 Saldo Utang: *${totalUtang}*`
  }

  pesan += `\n> _ketik *.lw* untuk melihat perubahan._`

  await xwyrken.sendMessage(m.chat, { text: pesan })
  break
}



case 'edit': {
  if (!isPremium)
    return xwyrken.sendMessage(m.chat, {
      react: { text: '😂', key: m.key }
    })

  if (args.length < 2)
    return xwyrken.sendMessage(m.chat, {
      text: 'Format:\n.edit NAMA JUMLAH\nContoh:\n.edit ASU -5'
    })

  const jumlah = parseInt(args.at(-1))
  if (isNaN(jumlah))
    return xwyrken.sendMessage(m.chat, {
      text: 'Jumlah harus angka (boleh minus)'
    })

  const nama = args.slice(0, -1).join(' ').toUpperCase()
  if (!nama)
    return xwyrken.sendMessage(m.chat, { text: 'Nama kosong' })

  const fs = require('fs')
  const file = './database/userdata.json'
  if (!fs.existsSync(file))
    return xwyrken.sendMessage(m.chat, { text: 'Data belum ada' })

  const data = JSON.parse(fs.readFileSync(file))
  const id = sender

  if (!data[id]?.saldo?.hasOwnProperty(nama))
    return xwyrken.sendMessage(m.chat, {
      text: 'Saldo tidak ditemukan'
    })

  // SALDO SEBELUM
  const saldoLama = data[id].saldo[nama]

  // UPDATE SALDO (SET NILAI)
  data[id].saldo[nama] = jumlah
  fs.writeFileSync(file, JSON.stringify(data, null, 2))

  const saldoBaru = data[id].saldo[nama]

  const output = `
⋆.˚Edit Saldo Berhasil⋆.˚
𖤍 Pemain: *${nama}*
𖤍 Saldo Sebelumnya: *${saldoLama}*
𖤍 Saldo Sekarang: *${saldoBaru}*
> ketik *.lw* untuk melihat perubahan.
`.trim()

  // REACT KE PESAN USER (OPSIONAL)
  await xwyrken.sendMessage(m.chat, {
    react: { text: '✅', key: m.key }
  })

  // KIRIM PESAN BIASA (TANPA REPLY)
  await xwyrken.sendMessage(m.chat, { text: output })
}
break

break
case 'tutup': {
  if (!isPremium) return xwyrken.sendMessage(m.chat, { react: { text: `❌`, key: m.key }})
  if (!isGroup) return

  const groupMetadata = await xwyrken.groupMetadata(from)
  const botNumber = xwyrken.user.id.split(':')[0] + '@s.whatsapp.net'
  const isBotAdmin = groupMetadata.participants.find(p => p.jid === botNumber)?.admin

  if (!isBotAdmin) return
  await xwyrken.groupSettingUpdate(from, 'announcement')
  await xwyrken.sendMessage(from, { react: { text: '🔒', key: m.key } })
}
break
      
case 'adp': {
  const  allowedOwner  = '62895413124456@s.whatsapp.net'
  if (sender !== allowedOwner) 
    return reply('❌ Hanya owner yang bisa menambahkan premium.')

  let target
  if (m.mentionedJid?.length) {
    target = m.mentionedJid[0]
  } else if (args[0]) {
    const number = args[0].replace(/[^0-9]/g, '')
    target = number + '@s.whatsapp.net'
  } else {
    return reply('⚠️ Format salah!\nGunakan: *.addprem @user 7d* atau *.addprem 628xxx 30d*')
  }

  let duration = args[1] || '30d'
  let timeMs = 0

  if (/^\d+d$/i.test(duration)) {
    timeMs = parseInt(duration) * 24 * 60 * 60 * 1000
  } else if (/^\d+h$/i.test(duration)) {
    timeMs = parseInt(duration) * 60 * 60 * 1000
  } else {
    return reply('⚠️ Format durasi salah!\nContoh: 1d, 7d, 30d, 12h')
  }

  if (!prem.includes(target)) {
    prem.push(target)
    fs.writeFileSync(premFile, JSON.stringify(prem, null, 2))
  }

  const expireTime = Date.now() + timeMs
  expireDB[target] = expireTime
  fs.writeFileSync(expireFile, JSON.stringify(expireDB, null, 2))

  const nomor = target.split('@')[0]
  const exp = new Date(expireTime)

  const tanggal = exp.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  let kategori = 'SEWA'
  if (duration.includes('30d')) kategori = 'SEWA'
  if (duration.includes('7d')) kategori = 'SEWA'
  else if (duration.includes('3d')) kategori = 'SEWA'
  else if (duration.includes('1d')) kategori = 'SEWA'
  else kategori = duration.toUpperCase()

  reply(
`✦ *BERHASIL MENAMBAHKAN PRO* ✦
*USER :* @${nomor}
*KATEGORI :* ${kategori}
*MASA PRO :* Sampai ${tanggal}`,
    { mentions: [target] }
  )
}
break
case 'delp': {
  const allowedOwner = '62895413124456@s.whatsapp.net'
  if (sender !== allowedOwner) return reply('❌ Hanya owner yang bisa menghapus premium.')

  let target  
  if (m.mentionedJid?.length) {  
    target = m.mentionedJid[0]  
  } else if (args[0]) {  
    const number = args[0].replace(/[^0-9]/g, '')  
    target = number + '@s.whatsapp.net'  
  } else {  
    return reply('⚠️ Format salah!\nGunakan: *.delprem @user* atau *.delprem 628xxx*')  
  }  

  if (!prem.includes(target)) return reply('⚠️ Nomor belum terdaftar premium.')  

  const idx = prem.indexOf(target)  
  if (idx !== -1) prem.splice(idx, 1)  
  delete expireDB[target]

  fs.writeFileSync(premFile, JSON.stringify(prem, null, 2))  
  fs.writeFileSync(expireFile, JSON.stringify(expireDB, null, 2))  

  reply(`✅ Berhasil menghapus @${target.split('@')[0]} dari premium.`, { mentions: [target] })  
}
break

case 'cek': {
  let cekNomor = args[0]
    ? args[0].replace(/\D/g, '')
    : sender.split('@')[0]

  const jid = cekNomor + '@s.whatsapp.net'

  // ===== BUKAN PREMIUM =====
  if (!prem?.includes(jid) && !expireDB?.[jid]) {
    return reply(
`*KAMU TIDAK MEMILIKI PRO*
*USER :* ${cekNomor}
> Silahkan beli ketik .sewa sudah otomatis.`
    )
  }

  // ===== PREMIUM WAKTU =====
  if (expireDB?.[jid]) {
    const now = Date.now()
    const expTime = expireDB[jid]
    const sisaMs = expTime - now

    if (sisaMs <= 0) {
      return reply(
`*KAMU TIDAK MEMILIKI PRO*
*USER :* ${cekNomor}
> Silahkan beli ketik .sewa sudah otomatis.`
      )
    }

    const hari = Math.floor(sisaMs / (1000 * 60 * 60 * 24))
    const jam = Math.floor((sisaMs / (1000 * 60 * 60)) % 24)
    const menit = Math.floor((sisaMs / (1000 * 60)) % 60)

    const exp = new Date(expTime)
    const tanggal = exp.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    let kategori = 'SEWA'
    if (hari >= 29) kategori = 'SEWA'
    if (hari >= 6) kategori = 'SEWA'
    else if (hari >= 2) kategori = 'SEWA'
    else kategori = 'SEWA'

    return reply(
`✦ *PRO AKTIF* ✦
*USER :* ${cekNomor}
*KATEGORI :* ${kategori}
*MASA PRO :* Sampai ${tanggal}
*SISA PRO :* ${hari} Hari ${jam} Jam ${menit} Menit
> Jika ingin habis ketik .perpanjang 😹.`
    )
  }

  // ===== PERMANEN =====
  return reply(
`✦ *VVIP AKTIF* ✦
*USER :* ${cekNomor}
*KATEGORI :* PERMANEN
> Keren.`
  )
}
break
break
case 'predik': {
  if (!m.quoted || !m.quoted.text) {
    return reply('Reply teks hasil game dulu!')
  }

  const text = m.quoted.text.toUpperCase()

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
  const chance = (p) => Math.random() * 100 < p

  // ======================
  // DETEKSI DEVICE & MERK
  // ======================
  let devMatch = text.match(/DEV\s*(.*)/)
  let devName = devMatch ? devMatch[1].trim() : 'UNKNOWN'

  let deviceType = 'UMUM'

  if (text.includes('IPHONE') || text.includes('IP ') || text.includes('IOS') || text.includes('SAFARI')) {
    deviceType = 'IOS'
  } else if (
    text.includes('SAMSUNG') ||
    text.includes('OPPO') ||
    text.includes('VIVO') ||
    text.includes('XIAOMI') ||
    text.includes('REALME') ||
    text.includes('INFINIX') ||
    text.includes('ANDROID') ||
    text.includes('CHROME') ||
    text.includes('GOOGLE')
  ) {
    deviceType = 'ANDROID'
  }

  // ======================
  // AMBIL GAME TERAKHIR
  // ======================
  let lastSide = null

  let matchKB = text.match(/GAME\s*\d+.*?(K|B)\s*(\d+)/g)
  if (matchKB) {
    let last = matchKB[matchKB.length - 1]
    let m2 = last.match(/(K|B)\s*(\d+)/)
    if (m2) lastSide = m2[1]
  }

  let mpl = text.match(/(\d+)-(\d+)/)
  let kananKiri = text.match(/(KANAN|KIRI)\s*(\d+)-(\d+)/)

  let predSide
  let predNumber
  let predText

  // ======================
  // MODE KANAN / KIRI
  // ======================
  if (kananKiri) {

    let kiri, kanan

    if (deviceType === 'IOS') {
      kiri = chance(70) ? rand(5, 10) : rand(10, 15)
      kanan = chance(70) ? rand(4, 9) : rand(9, 14)
    } else {
      kiri = rand(5, 14)
      kanan = rand(5, 14)
    }

    let total = kiri + kanan
    predText = `GAME NEXT : KIRI ${kiri}-${kanan} (${total})`

  }

  // ======================
  // MODE MPL
  // ======================
  else if (mpl) {

    if (deviceType === 'IOS') {
      predSide = chance(60) ? 'K' : 'B'
    } else if (deviceType === 'ANDROID') {
      predSide = lastSide === 'K'
        ? (chance(65) ? 'B' : 'K')
        : (chance(65) ? 'K' : 'B')
    } else {
      predSide = chance(50) ? 'K' : 'B'
    }

    predNumber = predSide === 'K'
      ? rand(5, 30)
      : rand(33, 45)

    predText = `GAME NEXT : ${predSide} ${predNumber}`

  }

  // ======================
  // MODE NORMAL K/B
  // ======================
  else {

    if (deviceType === 'IOS') {

      if (lastSide === 'K') {
        predSide = chance(65) ? 'K' : 'B'
      } else {
        predSide = chance(65) ? 'B' : 'K'
      }

      // pola iphone kecil dulu
      if (chance(70)) {
        predNumber = predSide === 'K'
          ? rand(0, 18)
          : rand(32, 38)
      } else {
        predNumber = predSide === 'K'
          ? rand(19, 32)
          : rand(39, 45)
      }

    } else if (deviceType === 'ANDROID') {

      // zigzag android
      if (lastSide === 'K') predSide = 'B'
      else if (lastSide === 'B') predSide = 'K'
      else predSide = chance(50) ? 'K' : 'B'

      predNumber = predSide === 'K'
        ? rand(0, 32)
        : rand(32, 45)

    } else {

      predSide = chance(50) ? 'K' : 'B'
      predNumber = predSide === 'K'
        ? rand(0, 32)
        : rand(32, 45)
    }

    predText = `GAME NEXT : ${predSide} ${predNumber}`
  }

  // ======================
  // ANTI DUPLIKAT ANGKA
  // ======================
  if (!global.lastPredik) global.lastPredik = {}

  let userId = m.sender
  let currentPred = `${predSide}${predNumber}`

  if (global.lastPredik[userId] === currentPred) {
    predNumber = predSide === 'K'
      ? rand(0, 32)
      : rand(32, 45)

    currentPred = `${predSide}${predNumber}`
  }

  global.lastPredik[userId] = currentPred

  let akurasi = rand(80, 93)

  // ======================
  // KIRIM HASIL
  // ======================
  await xwyrken.sendMessage(m.chat, {
    text:
`🔮 PREDIKSI GAME DEVICE

DEVICE : ${devName}
TIPE : ${deviceType}

${predSide} ${predNumber}

Akurasi Sistem : ${akurasi}%

Prediksi membaca pola histori sebelumnya
(Tidak 100% akurat)`
  }, { quoted: m })
}
break

case 'listprem': {
  const allowedOwner = '62895413124456@s.whatsapp.net' // ganti nomor owner kamu
  if (sender !== allowedOwner) return reply('❌ Hanya owner yang bisa menambahkan premium.')

  if (prem.length === 0) {
    return reply('📭 Belum ada user premium.')
  }

  let teks = '👑 *DAFTAR USER PREMIUM* 👑\n\n'
  prem.forEach((jid, i) => {
    const nomor = jid.split('@')[0]
    if (expireDB[jid]) {
      const sisa = expireDB[jid] - Date.now()
      teks += `${i + 1}. wa.me/${nomor} (⏳ ${formatDuration(sisa)})\n`
    } else {
      teks += `${i + 1}. wa.me/${nomor} (♾️ Permanen)\n`
    }
  })

  reply(teks)
}
break

  case 'lwg': {
  if (!isPremium)
    return xwyrken.sendMessage(m.chat, {
      react: { text: `🙊`, key: m.key }
    })

  const fs = require('fs')
  const path = './all/database'

  const lwFile = `${path}/lwinfo.json`
  const gameKBFile = `${path}/gamehistory.json`
  const gameKKFile = `${path}/gamehistory_kanankiri.json`

  const lwData = fs.existsSync(lwFile)
    ? JSON.parse(fs.readFileSync(lwFile))
    : {}

  const gameKB = fs.existsSync(gameKBFile)
    ? JSON.parse(fs.readFileSync(gameKBFile))
    : {}

  const gameKK = fs.existsSync(gameKKFile)
    ? JSON.parse(fs.readFileSync(gameKKFile))
    : {}

  const id = m.sender
  const number = id.split('@')[0]

  const moment = require('moment-timezone')
  moment.locale('id')

  const tanggalLW = `*LW ${moment
    .tz('Asia/Jakarta')
    .format('DD MMMM YYYY')
    .toUpperCase()}*`

  // ===== OUTPUT HEADER =====
  const lwText = lwData[id] || ''

  let output = `LW @${number}\n`

  // teks dari lwinfo.json tepat di bawah mention
  if (lwText) {
    output += `${lwText}\n\n`
  }

  // tanggal
  output += `${tanggalLW}\n`

  // ===== AUTO DETECT GAME =====
  let games = []

  if (Array.isArray(gameKK[id]) && gameKK[id].length) {
    games = gameKK[id]
  } else if (Array.isArray(gameKB[id]) && gameKB[id].length) {
    games = gameKB[id]
  }

  // ===== GAME OUTPUT =====
  if (!games.length) {
    output += `*GAME 1* : FRESH`
  } else {
    games.forEach((g, i) => {
      const boldKurung = g.replace(/\(([^)]+)\)/g, '*($1)*')

      let isi = boldKurung
      if (isi.startsWith('B ')) isi = isi.replace(/^B\s+/, 'BESAR ')
      else if (isi.startsWith('K ')) isi = isi.replace(/^K\s+/, 'KECIL ')

      output += `*GAME ${i + 1}* : ${isi}\n`
    })
    output = output.trimEnd()
  }

  // ===== KIRIM =====
  xwyrken.sendMessage(m.chat, {
    text: output,
    mentions: [id]
  }, { quoted: m })

  break
}
case 'lw': {
  if (!isPremium)
    return xwyrken.sendMessage(m.chat, {
      react: { text: `🙊`, key: m.key }
    })

  const fs = require('fs')
  const path = './all/database'

  const userFile = './database/userdata.json'
  const lwFile = `${path}/lwinfo.json`
  const gameKBFile = `${path}/gamehistory.json`
  const gameKKFile = `${path}/gamehistory_kanankiri.json`

  const userData = fs.existsSync(userFile)
    ? JSON.parse(fs.readFileSync(userFile))
    : {}

  const lwData = fs.existsSync(lwFile)
    ? JSON.parse(fs.readFileSync(lwFile))
    : {}

  const gameKB = fs.existsSync(gameKBFile)
    ? JSON.parse(fs.readFileSync(gameKBFile))
    : {}

  const gameKK = fs.existsSync(gameKKFile)
    ? JSON.parse(fs.readFileSync(gameKKFile))
    : {}

  const id = m.sender
  const number = id.split('@')[0]

  const moment = require('moment-timezone')
  moment.locale('id')

  const tanggalLW = `*LW ${moment
    .tz('Asia/Jakarta')
    .format('DD MMMM YYYY')
    .toUpperCase()}*`

  // ===== HEADER =====
  const lwText = lwData[id] || ''

  let output = `LW @${number}\n`

  if (lwText) {
    output += `${lwText}\n\n`
  }

  output += `${tanggalLW}\n`

  // ===== AUTO DETECT GAME =====
  let games = []

  if (Array.isArray(gameKK[id]) && gameKK[id].length) {
    games = gameKK[id]
  } else if (Array.isArray(gameKB[id]) && gameKB[id].length) {
    games = gameKB[id]
  }

  // ===== GAME OUTPUT =====
  if (!games.length) {
    output += `*MASI FRESH⚡*\n\n`
  } else {
    games.forEach((g, i) => {
      let isi = g.replace(/\(([^)]+)\)/g, '*($1)*')

      if (isi.startsWith('B ')) isi = isi.replace(/^B\s+/, 'BESAR ')
      else if (isi.startsWith('K ')) isi = isi.replace(/^K\s+/, 'KECIL ')

      output += `*GAME ${i + 1}* : ${isi}\n`
    })
    output += `\n`
  }

  // ===== SALDO & UTANG =====
  const saldo = userData[id]?.saldo || {}
  const semua = Object.entries(saldo)

  const positif = semua
    .filter(([_, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])

  const negatif = semua
    .filter(([_, v]) => v < 0)
    .sort((a, b) => a[1] - b[1])

  const totalPositif = positif.reduce((a, [_, v]) => a + v, 0)
  const totalNegatif = negatif.reduce((a, [_, v]) => a + v, 0)

  // ===== SALDO =====
  if (positif.length) {
    output += `*SALDO MAFIA (${totalPositif})*\n`
    output += positif
      .map(([n, v], i) => {
        const emoji = i === 0 ? ' 👑' : ''
        return `${n.toUpperCase()} ${v}${emoji}`
      })
      .join('\n')
    output += `\n\n`
  }

  // ===== UTANG =====
  if (negatif.length) {
    output += `*UTANG (${totalNegatif})*\n`
    output += negatif
      .map(([n, v], i) => {
        const emoji = i === 0 ? ' 🩲' : ''
        return `${n.toUpperCase()} ${v}${emoji}`
      })
      .join('\n')
  }

  // ===== KIRIM =====
  xwyrken.sendMessage(m.chat, {
    text: output.trimEnd(),
    mentions: [id]
  }, { quoted: m })

  break
}
case 'poll': {
  if (!isPremium) 
    return xwyrken.sendMessage(m.chat, { react: { text: `❌`, key: m.key }});

  if (!args.length)
    return reply('❗ Format salah!\nContoh:\n.poll Mau Lanjut Push Rank?');

  const judul = args.join(' ').trim();
  if (!judul) return reply('❗ Judul polling tidak boleh kosong!');

  await xwyrken.sendMessage(m.chat, {
    poll: {
      name: judul,
      values: [
        "☑️ GASSKENN",
        "❎ NANTI"
      ]
    }
  });
}
break;
case 'antitagsw': {
  if (!m.isGroup) return
  if (!isPremium) return

  if (!args[0]) return reply('.antitagsw on / off')

  if (args[0] === 'on') {
    antitagDB[m.chat] = true
    fs.writeFileSync(antiswPath, JSON.stringify(antitagDB, null, 2))
    await xwyrken.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
  }

  if (args[0] === 'off') {
    delete antitagDB[m.chat]
    fs.writeFileSync(antiswPath, JSON.stringify(antitagDB, null, 2))
    await xwyrken.sendMessage(m.chat, { react: { text: '❌', key: m.key }})
  }
  break
}
case 'lb': {
let nama, angka, huruf
const pushname = m.pushName || m.sender.split('@')[0] || 'USER'

if(args.length){
if(args.length == 1){
nama = pushname
angka = args[0]
}else{
huruf = args[0].toUpperCase()
angka = args[1]
nama = pushname
}

}else{

if(!m.quoted) return reply('reply pesan atau ketik .lb 120')

let text = m.quoted.text || m.quoted.caption || ''

let match = text.match(/^([^\d]+)\s*(\d+)\s*([a-zA-Z]*)$/)

if(!match) return reply('format salah')

nama = match[1]
angka = match[2]
huruf = match[3]
}

nama = nama.trim().toUpperCase()
huruf = (huruf || '').toUpperCase()

// huruf D tidak disimpan di DB
let hurufDb = huruf === 'D' ? '' : huruf

let simpan = `${nama} ${angka}${hurufDb ? ' '+hurufDb : ''}`

// pastikan db ada
if(!db[jid]) db[jid] = { besar: [], kecil: [] }
if(!db[jid].besar) db[jid].besar = []

// simpan text + pesan yang direply
db[jid].besar.push({
text: simpan,
key: m.quoted ? m.quoted.key : m.key
})

saveDb()

let tampil = `${nama} ${angka}${huruf ? ' '+huruf : ''}`

await reply(`BESAR:

${tampil}`)

await xwyrken.sendMessage(m.chat, {
react: {
text: "✅",
key: m.key
}
})

}
break
case 'lk': {
let nama, angka, huruf
const pushname = m.pushName || m.sender.split('@')[0] || 'USER'

if(args.length){
if(args.length == 1){
nama = pushname
angka = args[0]
}else{
huruf = args[0].toUpperCase()
angka = args[1]
nama = pushname
}

}else{

if(!m.quoted) return reply('reply pesan atau ketik .lk 120')

let text = m.quoted.text || m.quoted.caption || ''

let match = text.match(/^([^\d]+)\s*(\d+)\s*([a-zA-Z]*)$/)

if(!match) return reply('format salah')

nama = match[1]
angka = match[2]
huruf = match[3]
}

nama = nama.trim().toUpperCase()
huruf = (huruf || '').toUpperCase()

// huruf D tidak disimpan di DB
let hurufDb = huruf === 'D' ? '' : huruf

let simpan = `${nama} ${angka}${hurufDb ? ' '+hurufDb : ''}`

// pastikan db ada
if(!db[jid]) db[jid] = { besar: [], kecil: [] }
if(!db[jid].kecil) db[jid].kecil = []

// simpan text + pesan yang direply
db[jid].kecil.push({
text: simpan,
key: m.quoted ? m.quoted.key : m.key
})

saveDb()

let tampil = `${nama} ${angka}${huruf ? ' '+huruf : ''}`

await reply(`KECIL:

${tampil}`)

await xwyrken.sendMessage(m.chat, {
react: {
text: "✅",
key: m.key
}
})

}
break
case 'rekb': {

const getFee = (n) => Math.floor(n / 10) + 1

if (!db[jid] || !db[jid].besar || db[jid].besar.length === 0)
return reply('Data BESAR kosong')

let raw = db[jid].besar.map(v => typeof v === 'string' ? v : v.text).join('\n')

const lines = raw.split('\n').map(v=>v.trim()).filter(v=>v)

const dataKategori = {}
const feeKategori = {}

let currentKategori = "BESAR"

dataKategori[currentKategori] = []
feeKategori[currentKategori] = 0

// titik pesan pemain dulu
for (let item of db[jid].besar) {

if (item && item.key) {
await xwyrken.sendMessage(m.chat, {
text: '.'
}, {
quoted: item.key
})
}

}

// hitung rekap
for (let line of lines) {

const match = line.match(/^([^\d]+)\s*(\d+)\s*([a-zA-Z]*)$/)
if (!match) continue

const nama = match[1].trim().toUpperCase()
const angkaAwal = Number(match[2])
const huruf = (match[3] || '').toUpperCase()

const fee = getFee(angkaAwal)
feeKategori[currentKategori] += fee

let angkaAkhir

if (huruf === 'LF') {
angkaAkhir = angkaAwal - (fee * 2)
} else if (huruf) {
angkaAkhir = angkaAwal - fee
} else {
angkaAkhir = angkaAwal * 2 - fee
}

dataKategori[currentKategori].push({
nama,
angkaAwal,
angkaAkhir,
huruf
})
}

const formatHasil = (arr) =>
arr.map(v =>
`${v.nama} ${v.angkaAwal} \\ ${v.angkaAkhir}${v.huruf ? ' '+v.huruf : ''}`
).join('\n')

let output = ''

output += `BESAR:\n`
output += formatHasil(dataKategori["BESAR"]) + '\n'
output += `FEE BESAR: ${feeKategori["BESAR"]}`

// kirim rekap
reply(output.trim())

}
break
case 'rekk': {

const getFee = (n) => Math.floor(n / 10) + 1

if (!db[jid] || !db[jid].kecil.length)
return reply('Data KECIL kosong')

let raw = db[jid].kecil.map(v => typeof v === 'string' ? v : v.text).join('\n')

const lines = raw.split('\n').map(v=>v.trim()).filter(v=>v)

let data = []
let totalFee = 0

for (let item of db[jid].kecil) {

if (item && item.key) {
await xwyrken.sendMessage(m.chat,{text:'.'},{quoted:item.key})
await new Promise(r=>setTimeout(r,300))
}

}

for (let line of lines) {

const match = line.match(/^([^\d]+)\s*(\d+)\s*([a-zA-Z]*)$/)
if (!match) continue

const nama = match[1].trim().toUpperCase()
const angkaAwal = Number(match[2])
const huruf = (match[3] || '').toUpperCase()

const fee = getFee(angkaAwal)
totalFee += fee

let angkaAkhir

if (huruf === 'LF') {
angkaAkhir = angkaAwal - (fee * 2)
} else if (huruf) {
angkaAkhir = angkaAwal - fee
} else {
angkaAkhir = angkaAwal * 2 - fee
}

data.push(`${nama} ${angkaAwal} \\ ${angkaAkhir}${huruf ? ' '+huruf : ''}`)

}

let output = `KECIL:\n${data.join('\n')}\nFEE KECIL: ${totalFee}`

reply(output)

}
break
case 'resetall': {

if (!isPremium) 

db[jid] = {
besar: [],
kecil: []
}

saveDb()

await xwyrken.groupUpdateDescription(m.chat,'')

reply('Database dan desk berhasil direset')

}
break
case 'antilink': {
  if (!m.isGroup) return reply('⚠️ KHUSUS GRUP')
  if (!isPremium) return reply('❌ KHUSUS PREMIUM')

  const fs = require('fs')
  const path = './all/database/antilink.json'

  if (!fs.existsSync('./all/database')) {
    fs.mkdirSync('./all/database', { recursive: true })
  }

  let db = {}
  if (fs.existsSync(path)) {
    db = JSON.parse(fs.readFileSync(path))
  }

  if (!args[0]) return reply('❗ Gunakan: .antilink on / off')

  if (args[0] === 'on') {
    db[m.chat] = true
    fs.writeFileSync(path, JSON.stringify(db, null, 2))
    reply('✅ Antilink *AKTIF*')
  } else if (args[0] === 'off') {
    db[m.chat] = false
    fs.writeFileSync(path, JSON.stringify(db, null, 2))
    reply('❌ Antilink *DIMATIKAN*')
  } else {
    reply('❗ Gunakan: .antilink on / off')
  }
  break
}
case 'antichannel': {
  if (!m.isGroup) return
  if (!isPremium) return
  
  const fs = require('fs')
  const antiPath = './all/database/antichannel.json'
  let antiDB = {}

  if (fs.existsSync(antiPath)) {
    antiDB = JSON.parse(fs.readFileSync(antiPath))
  }

  if (args[0] === 'on') {
    antiDB[m.chat] = true
    fs.writeFileSync(antiPath, JSON.stringify(antiDB, null, 2))

    await xwyrken.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })
  } 
  
  else if (args[0] === 'off') {
    delete antiDB[m.chat]
    fs.writeFileSync(antiPath, JSON.stringify(antiDB, null, 2))

    await xwyrken.sendMessage(m.chat, {
      react: {
        text: '🔴',
        key: m.key
      }
    })
  }
}
break

break
case 'dels': {
  if (!isPremium)
    return xwyrken.sendMessage(m.chat, {
      react: { text: '😂', key: m.key }
    })

  const nama = args.join(' ').toUpperCase()
  if (!nama)
    return xwyrken.sendMessage(m.chat, {
      text: 'Format:\n.dels NAMA\nContoh:\n.ds ASU'
    })

  const fs = require('fs')
  const file = './database/userdata.json'
  if (!fs.existsSync(file))
    return xwyrken.sendMessage(m.chat, { text: 'Data belum ada' })

  const data = JSON.parse(fs.readFileSync(file))
  const id = sender

  if (!data[id]?.saldo?.hasOwnProperty(nama))
    return xwyrken.sendMessage(m.chat, {
      text: `❌ Tidak ada saldo atas nama *${nama}*`
    })

  // SALDO SEBELUM DIHAPUS
  const saldoLama = data[id].saldo[nama]

  // HAPUS
  delete data[id].saldo[nama]
  fs.writeFileSync(file, JSON.stringify(data, null, 2))

  const output = `
⋆.˚Terhapus⋆.˚
❀ Pemain: *${nama}*
❀ Status: *${saldoLama} ➞ DIHAPUS*
> _ketik *.lw* untuk melihat perubahan._
`.trim()
  await xwyrken.sendMessage(m.chat, { text: output })
}
break

case 'rvo':
case 'readviewonce': {
    if (!isPremium) return reply('hanya admin dan owner')
    if (!m.quoted) return reply(`Balas pesan viewonce dengan caption ${prefix + command}`);
    
    try {
        const quoted = m.quoted;
        const media = await quoted.download();
        const type = quoted.mtype;

        if (type === 'videoMessage') {
            await xwyrken.sendMessage(m.chat, {
                video: media,
                caption: `_Berhasil membuka pesan viewonce_`,
                mimetype: 'video/mp4'
            }, { quoted: m });

        } else if (type === 'imageMessage') {
            await xwyrken.sendMessage(m.chat, {
                image: media,
                caption: `_Berhasil membuka pesan viewonce_`
            }, { quoted: m });

        } else {
            reply('Jenis pesan viewonce tidak dikenali.');
        }

    } catch (err) {
        console.error('Error buka viewonce:', err.message);
        reply('Gagal membuka pesan viewonce. Mungkin format tidak didukung.');
    }
    break;
}
case 'und':
case 'unadmin': {
  if (!isGroup) break
  if (!isPremium) break

  const groupMetadata = await xwyrken.groupMetadata(from)
  const botNumber = xwyrken.user.id.split(':')[0] + '@s.whatsapp.net'

  const isBotAdmin = groupMetadata.participants
    .find(p => p.jid === botNumber)?.admin

  if (!isBotAdmin) break
  if (!m.mentionedJid?.length) break

  const target = m.mentionedJid[0]
  if (target === botNumber) break

  await xwyrken.groupParticipantsUpdate(from, [target], 'demote')

  await xwyrken.sendMessage(from, {
    react: { text: '☑️', key: m.key }
  })

  break
}

case 'admin': {
  if (!isGroup) return
  if (!isPremium) return
const groupMetadata = await xwyrken.groupMetadata(from)
const botNumber = xwyrken.user.id.split(':')[0] + '@s.whatsapp.net'
const isBotAdmin = groupMetadata.participants.find(p => p.jid === botNumber)?.admin
if (!isBotAdmin) return await xwyrken.sendMessage(from, 'Bot harus menjadi admin untuk menjalankan perintah ini')

  if (!m.mentionedJid?.length) return

  const target = m.mentionedJid[0]

  await xwyrken.groupParticipantsUpdate(
    from,
    [target],
    'promote'
  )

  // REAKSI SAJA (SILENT)
  await xwyrken.sendMessage(from, {
    react: { text: '✅', key: m.key }
  })
}
break

case 'h':
case 'ht': {
  if (!isGroup) return
  if (!isPremium) return

  const metadata = await xwyrken.groupMetadata(from)
  const participants = metadata.participants.map(p => p.id)

  let text = '*OPEN ALL SEBUT SEKALI*'

  if (m.quoted && m.quoted.text) {
    text = m.quoted.text
  } else if (args.length > 0) {
    text = args.join(' ')
  }

  xwyrken.sendMessage(from, { text, mentions: participants })
}
    }
  } catch (err) {
    console.error(err)
  }
}

function formatDuration(ms) {
  const d = Math.floor(ms / (24 * 60 * 60 * 1000))
  const h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  return `${d} hari ${h} jam ${m} menit`
}