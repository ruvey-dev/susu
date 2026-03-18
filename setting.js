/* SC CHULO V10.0
BASE : CHULO MODS
RECODE : CHULO
CREACOT : CHULO
FIX BY : NESTAMODS
*/

const fs = require('fs')
const chalk = require('chalk')

global.owner = "XAVIOR"
global.namabot = "XAVIOR"
global.botname = "XAVIOR"
global.autoJoin = false
global.thumb = fs.readFileSync("./all/image/foto.jpg")
global.codeInvite = "FwtMxovJqW3Jj55x524hjT"
global.sessionName = 'Session' //Gausah Juga
global.save = "View"
global.tekspushkon = ""
global.tekspushkonv2 = ""
global.packname = ""
global.author = "Sticker By RUVEY"
global.namastore = "RUVEY"
global.qris = fs.readFileSync("./all/image/qris.jpg")
global.nodana = "083897441426"
global.nogopay = "083897441426"
global.noovo = "Gapunya"
/* ============== KEY CASHIFY ============== */
// Ambil apikey di web https://cashify.my.id/
global.cashifyLicenseKey = 'cashify_fff897930403d9af0630641dae95da3437ce32cc016b169b7f2dd7638f1c4122' 
global.cashifyQrisId = 'b81fd56f-37aa-4b76-8b74-2a9ee6caf519'

const mess = {
   wait: "Tunggu Bang Lagi Saya Proses",
   success: "Succes Bang Chul✔️",
   save: "𝕊𝕌𝕂𝕊𝔼𝕊 𝕊𝔸𝕍𝔼 ℕ𝕆𝕄𝔼ℝ 𝕆𝕋𝕆𝕄𝔸𝕋𝕀𝕊",
   on: "Sudah Aktif", 
   off: "Sudah Off",
   query: {
       text: "Teks Nya Mana Kak?",
       link: "Link Nya Mana Kak?",
   },
   error: {
       fitur: "Mohon Maaf Kak Fitur Eror Silahkan Chat Developer Bot Agar Bisa Segera Diperbaiki",
   },
   only: {
       group: "Fitur Nya Cuman Bisa Di Dalem Grup Yah Bang",
       private: "Di Chat Pribadi Bang Dip Biar Bisa Di Pake",
       owner: "Ga Usah Pake Fitur Ini Asu Lu Bukan Bang Dip",
       admin: "Ga Usah Pake Fitur Ini Asu Lu Bukan Bang Dip",
       badmin: "Maaf Kak Kaya Nya Kakak Tidak Bisa Menggunakan Fitur Ini Di Karenakan Bot Bukan Admin Group",
       premium: "Maaf Kamu Belum Jadi User Premium Untuk Menjadi User Premium Silahkan Beli Ke Owner Dengan Cara Ketik .owner",
   }
}

global.mess = mess
//=================================================//
//Gausah Juga
global.limitawal = {
    premium: "Infinity",
    free: 100
}
//=================================================//
let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update'${__filename}'`))
	delete require.cache[file]
	require(file)
})