import dotenv from 'dotenv'
dotenv.config()

export default ({
    telegram: {
        token: process.env.TELEGRAM_TOKEN,
        apiUrl: `${process.env.API_URL}${'token'}`,
        apiFileUrl: `${process.env.API_FILE_URL}${'token'}`,
    }
})
