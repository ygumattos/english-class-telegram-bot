const { telegram } = require('./config')
const { Telegraf } = require('telegraf')
const Fs = require('fs')  
const Path = require('path')
const axios = require('axios')

const idsFile = []


// Iniciando o bot
const bot = new Telegraf(telegram.token)

bot.start( content => {
    const from = content.update.message.from

    console.log(from)

    content.reply(`Hello World, ${from.first_name}!`)
})

bot.on('text', (content, next) => {
    content.reply('Saaaalve !!')
    next()
})

bot.on("voice", async content => {
    const url = await content.telegram.getFileLink(content.message.voice.file_id)
    const path = Path.resolve(__dirname, 'voices', 'code.ogg')
    const writer = Fs.createWriteStream(path)

    const response = await axios({
        url: url.href,
        method: 'GET',
        responseType: 'stream'
      })

      response.data.pipe(writer)

      new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })    

  })

bot.startPolling()