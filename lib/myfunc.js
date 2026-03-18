/**
   * Create By Dev Ruvey.
   * Contact Me on wa.me/62895413124456
   * F0
*/

const {
  proto,
  delay,
  getContentType,
  areJidsSameUser,
  generateWAMessage
} = require("@whiskeysockets/baileys")

const chalk = require('chalk')
const fs = require('fs')
const Crypto = require('crypto')
const axios = require('axios')
const moment = require('moment-timezone')
const { sizeFormatter } = require('human-readable')
const util = require('util')
const Jimp = require('jimp')

/* ================= UTIL ================= */

const unixTimestampSeconds = (date = new Date()) =>
  Math.floor(date.getTime() / 1000)
exports.unixTimestampSeconds = unixTimestampSeconds

exports.generateMessageTag = (epoch) => {
  let tag = unixTimestampSeconds().toString()
  if (epoch) tag += '.--' + epoch
  return tag
}

exports.processTime = (timestamp, now) =>
  moment.duration(now - moment(timestamp * 1000)).asSeconds()

exports.getRandom = (ext) =>
  `${Math.floor(Math.random() * 10000)}${ext}`

exports.getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: "get",
      url,
      headers: { DNT: 1 },
      responseType: 'arraybuffer',
      ...options
    })
    return res.data
  } catch (e) {
    return null
  }
}

exports.fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      ...options
    })
    return res.data
  } catch (e) {
    return null
  }
}

exports.runtime = (seconds) => {
  seconds = Number(seconds)
  let d = Math.floor(seconds / (3600 * 24))
  let h = Math.floor(seconds % (3600 * 24) / 3600)
  let m = Math.floor(seconds % 3600 / 60)
  let s = Math.floor(seconds % 60)
  return [
    d ? d + ' day' : '',
    h ? h + ' hour' : '',
    m ? m + ' minute' : '',
    s ? s + ' second' : ''
  ].filter(Boolean).join(', ')
}

exports.sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms))

exports.isUrl = (url = '') =>
  /https?:\/\//.test(url)

exports.getTime = (format, date) =>
  date
    ? moment(date).locale('id').format(format)
    : moment.tz('Asia/Jakarta').locale('id').format(format)

exports.formatp = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2
})

exports.parseMention = (text = '') =>
  [...text.matchAll(/@([0-9]{5,16}|0)/g)]
    .map(v => v[1] + '@s.whatsapp.net')

exports.getGroupAdmins = (participants = []) =>
  participants.filter(p => p.admin).map(p => p.id)

/* ================= SERIALIZE MESSAGE ================= */

exports.smsg = (conn, m, store) => {
  if (!m) return m
  let M = proto.WebMessageInfo

  /* ===== KEY ===== */
  if (m.key) {
    m.id = m.key.id
    m.isBaileys = m.id?.startsWith('BAE5')
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.isGroup = m.chat?.endsWith('@g.us')
    m.sender = conn.decodeJid(
      m.fromMe ? conn.user.id : m.participant || m.key.participant || m.chat
    )
    if (m.isGroup) m.participant = conn.decodeJid(m.key.participant)
  }

  /* ===== MESSAGE ===== */
  if (m.message) {
    m.mtype = getContentType(m.message)

    if (m.mtype === 'viewOnceMessage') {
      m.msg = m.message?.viewOnceMessage?.message
        ? m.message.viewOnceMessage.message[
            getContentType(m.message.viewOnceMessage.message)
          ]
        : {}
    } else {
      m.msg = m.message[m.mtype] || {}
    }

    m.body =
      m.message?.conversation ||
      m.msg?.text ||
      m.msg?.caption ||
      (m.mtype === 'listResponseMessage' &&
        m.msg?.singleSelectReply?.selectedRowId) ||
      (m.mtype === 'buttonsResponseMessage' &&
        m.msg?.selectedButtonId) ||
      ''

    /* ===== QUOTED ===== */
    let quoted = m.msg?.contextInfo?.quotedMessage
    m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []

    if (quoted) {
      let type = Object.keys(quoted)[0]
      m.quoted = quoted[type]

      if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }

      m.quoted.mtype = type
      m.quoted.id = m.msg.contextInfo.stanzaId
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
      m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
      m.quoted.fromMe =
        m.quoted.sender === conn.decodeJid(conn.user.id)

      m.quoted.text =
        m.quoted.text ||
        m.quoted.caption ||
        m.quoted.conversation ||
        ''

      m.quoted.delete = () =>
        conn.sendMessage(m.quoted.chat, { delete: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id
        }})

      m.quoted.download = () =>
        conn.downloadMediaMessage(m.quoted)
    }
  }

  /* ===== TEXT ===== */
  m.text =
    m.msg?.text ||
    m.msg?.caption ||
    m.message?.conversation ||
    ''

  /* ===== DOWNLOAD ===== */
  if (m.msg?.url) {
    m.download = () => conn.downloadMediaMessage(m.msg)
  }

  /* ===== REPLY ===== */
  m.reply = (text, chatId = m.chat, options = {}) =>
    conn.sendMessage(chatId, { text }, { quoted: m, ...options })

  /* ===== COPY ===== */
  m.copy = () =>
    exports.smsg(conn, M.fromObject(M.toObject(m)), store)

  m.copyNForward = (jid = m.chat, force = false, options = {}) =>
    conn.copyNForward(jid, m, force, options)

  return m
}

/* ================= HOT RELOAD ================= */

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright(`Update ${__filename}`))
  delete require.cache[file]
  require(file)
})
