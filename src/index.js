const { Telegraf, Extra, Markup } = require('telegraf')
const TelegrafStatelessQuestion = require('telegraf-stateless-question')
const LocalSession = require('telegraf-session-local')
const { createWriteStream } = require('fs')
const { resolve } = require('path')
const axios = require('axios')

const { telegram } = require('./config')
const data = require('./database')

// Instance bot
const bot = new Telegraf(telegram.token)

// Instance database session
const databasePath = resolve(__dirname, 'database', 'session.json')
bot.use((new LocalSession({ database: databasePath })).middleware())

// Init bot
bot.start(content => {
  const { username, language_code: language, first_name } = content.update.message.from

  content.session.username = username
  content.session.language = language
  content.session.voiceId = null
  content.session.studentsUsername = []

  console.log(content.session)

  console.log({ username, language })

  content.reply(`Hiii, ${first_name}!`)
  content.reply(`Lets goo to finish your class !!`)
})

// Buttons

const studentsButtons = (content) => content.session.studentsUsername.map(student => Markup.button.callback(student, `sendAudio ${student}`))

// Commands

bot.on("voice", async (content, next) => {

  const { voice: { file_id }, from: { username } } = content.message
  const filename = `${username}-${file_id}`
  const url = await content.telegram.getFileLink(file_id)
  const path = resolve(__dirname, '..', 'temp', 'voices', `${filename}.ogg`)
  // const writer = createWriteStream(path)

  console.log(content.session.voiceId)

  if (content.session.voiceId) content.reply('Seu audio anterior foi substituido')

  content.session.voiceId = file_id

  // const response = await axios({
  //   url: url.href,
  //   method: 'GET',
  //   responseType: 'stream'
  // })

  // response.data.pipe(writer)

  // new Promise((resolve, reject) => {
  //   writer.on('finish', resolve)
  //   writer.on('error', reject)
  // })

})

bot.command('add_student', content => {
  const [, studentUserName] = content.message.text.split(' ')
  content.session.studentsUsername.push(studentUserName)
  content.reply('Aluno salvo')
})

bot.command('list_students', content => {
  listStudents(content)
})

// Functions

const listStudents = (content) => {
  if (content.session.studentsUsername.length < 1) return content.reply('Adicione um studante com /add_student')
  return content.reply('Qual aluno deseja enviar o audio?', {
    ...Markup.inlineKeyboard(
      studentsButtons(content),
      { columns: 2 }
    ),
  })
}

// Launch

bot.launch()