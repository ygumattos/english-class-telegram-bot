const { Telegraf } = require('telegraf')
const LocalSession = require('telegraf-session-local')

const bot = new Telegraf('1734709718:AAH8tU9svtAkoG3qR_iaE-B3gHOfwsrsWTQ') // Your Bot token here

bot.use((new LocalSession({ database: 'example_db.json' })).middleware())

bot.start((ctx, next) => {
    ctx.session.message = []
    return next()
})

bot.on('text', (ctx, next) => {
    ctx.session.counter = ctx.session.counter || 0
    ctx.session.counter++
    ctx.session.message.push(ctx.update.message.from.first_name)
    ctx.replyWithMarkdown(`Counter updated, new value: \`${ctx.session.counter}\``)
    return next()
})

bot.command('/stats', (ctx) => {
    ctx.replyWithMarkdown(`Database has \`${ctx.session.counter}\` messages from @${ctx.from.username || ctx.from.id}`)
})

bot.command('/remove', (ctx) => {
    ctx.replyWithMarkdown(`Removing session from database: \`${JSON.stringify(ctx.session)}\``)
    // Setting session to null, undefined or empty object/array will trigger removing it from database
    ctx.session = null
})

bot.launch()