import { cpus as _cpus, totalmem, freemem, uptime as osUptime, arch, platform } from 'os'
import { performance } from 'perf_hooks'
import { sizeFormatter } from 'human-readable'
import process from 'process'

let format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn, usedPrefix, command }) => {
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))
  const privateChats = chats.filter(([id]) => !id.endsWith('@g.us'))
  const used = process.memoryUsage()

  const cpus = _cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
    return cpu
  })

  const cpu = cpus.reduce((last, cpu, _, { length }) => {
    last.total += cpu.total
    last.speed += cpu.speed / length
    last.times.user += cpu.times.user
    last.times.nice += cpu.times.nice
    last.times.sys += cpu.times.sys
    last.times.idle += cpu.times.idle
    last.times.irq += cpu.times.irq
    return last
  }, {
    speed: 0,
    total: 0,
    times: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    }
  })

  // حساب سرعة الاستجابة
  let old = performance.now()
  await new Promise(resolve => setTimeout(resolve, 10))
  let neww = performance.now()
  let speed = neww - old

  let wm = 'اسم السيرفر'  // تخصيص اسم السيرفر
  let fgig = 'عنوان الصورة أو النص'
  
  // الوقت الحالي
  let currentTime = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })

  // وقت التشغيل (Uptime)
  let uptime = process.uptime()
  let osUptimeInMinutes = Math.floor(osUptime() / 60)

  // حساب استخدام الـ CPU
  let cpuUsage = (1 - (cpu.times.idle / cpu.total)) * 100

  // النسخة الحالية من Node.js
  let nodeVersion = process.version

  // نوع النظام (نظام التشغيل)
  let osType = platform()

  let infobt = `╭─╮─🧞─᤻─🧞 「 ${wm} 」
├🚀 *السرعة*: 🧞 *${speed.toFixed(2)}* ms
├📅 *الوقت الحالي:* 🧞 ${currentTime}
*╰┄̸࣭۫*

╭─╮─🧞─᤻─🧞 「 *معلومات السيرفر* 」
├🛑 *RAM:* 🧞 ${format(totalmem() - freemem())} / ${format(totalmem())}
├🔵 *ذاكرة RAM الحرة:* 🧞 ${format(freemem())}
├💻 *عدد المعالجات:* 🧞 ${cpus.length} 
├⚡ *سرعة المعالج:* 🧞 ${cpu.speed} MHz
├🔥 *استخدام CPU الحالي:* 🧞 ${cpuUsage.toFixed(2)}%
├⏳ *مدة تشغيل النظام:* 🧞 ${osUptimeInMinutes} دقيقة
├💾 *المساحة المتبقية:* 🧞 ${format(freemem())}
├💻 *نوع النظام:* 🧞 ${osType} - ${arch()}
├🔢 *إصدار Node.js:* 🧞 ${nodeVersion}
*╰┄̸࣭۫*

╭─╮─🧞─᤻─🧞 「 *المحادثات* 」
├👥 *المجموعات:* 🧞 ${groupsIn.length}
├👤 *الدردشات الخاصة:* 🧞 ${privateChats.length}
├📨 *الرسائل المعالجة:* 🧞 ${conn.msgCount}
*╰┄̸࣭۫*

*≡  استخدام الذاكرة في NodeJS*
${'```' + Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v => v.length)), ' ')}: ${format(used[key])}`).join('\n') + '```'}
`

  m.reply(infobt)
  conn.sendButton(m.chat, infobt, fgig, null, [
    ['Menu', `${usedPrefix}menu`],
    ['Grupos', `${usedPrefix}grupos`]
  ], m)
}

handler.help = ['info']
handler.tags = ['main']
handler.command = ['calculo', 'منصه', 'CALCULO']
handler.register = true

export default handler