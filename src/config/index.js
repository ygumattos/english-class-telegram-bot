require('dotenv').config()

module.exports = ({
    telegram: {
        token: process.env.TELEGRAM_TOKEN,
        apiUrl: `${process.env.API_URL}${process.env.TELEGRAM_TOKEN}`,
        apiFileUrl: `${process.env.API_FILE_URL}${process.env.TELEGRAM_TOKEN}`,
        admId: process.env.ADM_ID
    }
})
