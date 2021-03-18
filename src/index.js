const { Telegraf, Extra, Markup, Telegram } = require('telegraf')
const TelegrafStatelessQuestion = require('telegraf-stateless-question')
const LocalSession = require('telegraf-session-local')
const { createWriteStream } = require('fs')
const { resolve } = require('path')
const axios = require('axios')

const { telegram } = require('./config')
const data = require('./database')

// Instance bot
const bot = new Telegraf(telegram.token)

// Instance telegram options
const telegramOptions = new Telegram(telegram.token)

// Instance database session
const databasePath = resolve(__dirname, 'database', 'session.json')
bot.use((new LocalSession({ database: databasePath })).middleware())

// Init bot
bot.start(content => {
  const { username, language_code: language, first_name, last_name } = content.update.message.from

  content.session.username = username ? username : `${first_name}-${last_name}`
  content.session.language = language
  content.session.voiceId = null
  content.session.studentsUsername = []

  console.log(content.session)

  console.log({ username, language })

  content.reply(`Hiii, ${first_name}!`)
  content.reply(`Lets goo to finish your class !!`)
})

// Buttons

const studentsButtons = (content) => content.session.studentsUsername.map(student => Markup.button.callback(student.name, `sendAudio ${student.id} ${student.name}`))

// Listening

bot.on('voice', async (content, next) => {

  const { voice: { file_id }, from: { username } } = content.message


  console.log(content.session.voiceId)

  if (content.session.voiceId) content.reply('Seu audio anterior foi substituido')

  content.session.voiceId = file_id

})

bot.on('forward_date', (content) => {
  const { forward_from: {
    id,
    language_code: language,
    first_name,
    last_name,
  } } = content.message

  const name = `${first_name} ${last_name}`

  content.session.studentsUsername.push({
    id,
    name,
    language
  })

  content.reply(`Aluno(a) ${name} salvo 😘️`)
})

// Commands

bot.command('send_adm', async (content) => {
  const { username, first_name, last_name } = content.message.from
  const name = username ? username : `${first_name} ${last_name}`
  const text = content.message.text.split(' ').filter((text, index) => index !== 0).join(' ')
  const msg = `From: ${name} \nMsg: ${text}`
  await sendMessage({ userId: telegram.admId, msg })
})

bot.command('add_student', content => {
  content.reply(`Você deve compartilhar uma msg do seu aluno(a) comigo ❤️`)
})

bot.command('list_students', content => {
  listStudents(content)
})

// Actions

bot.action(/sendAudio (.+)/, async content => {
  const [userId, firstName, lastName] = content.match[1].split(' ')
  const userName = `${firstName} ${lastName}`
  const { voiceId, username } = content.session

  if (!voiceId) return content.reply('Audio não localizo !!')

  await sendAudio({ voiceId, userId })

  const message = `${username} te enviou um audio 😘️`
  await sendMessage({ userId, message })

  content.reply(`${userName} recebeu seu audio 🤩️ `)
})

// Functions

const listStudents = (content) => {
  if (content.session.studentsUsername.length < 1) return content.reply('Adicione um studante com /add_student')
  return content.reply('Qual aluno(a) deseja enviar o audio? 🎶️', {
    ...Markup.inlineKeyboard(
      studentsButtons(content),
      { columns: 2 }
    ),
  })
}

const sendAudio = async ({ voiceId, userId }) => {
  await telegramOptions.sendVoice(userId, voiceId)
}

const sendMessage = async ({ userId, message }) => {
  await telegramOptions.sendMessage(userId, message)
}

// const downloadAudio = async ({ url, audioId, name }) => {

//   const filename = `${name}-${audioId}`
//   const path = resolve(__dirname, '..', 'temp', 'voices', `${filename}.ogg`)
//   const writer = createWriteStream(path)

//   const response = await axios({
//     url: url.href,
//     method: 'GET',
//     responseType: 'stream'
//   })

//   response.data.pipe(writer)

//   new Promise((resolve, reject) => {
//     writer.on('finish', resolve)
//     writer.on('error', reject)
//   })

// }

// Launch

bot.launch()