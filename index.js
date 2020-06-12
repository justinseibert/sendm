require('dotenv').config()
const readline = require('readline')
const markdown = require( 'markdown' ).markdown
let mailgun = require('mailgun-js')

const apiKey = process.env.MAILGUN_API_KEY

const ask = async (question) => {
  return new Promise((resolve,reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(question + ': ', (value) => {
      rl.close()
      resolve(value)
    })
  })
}

const askMultiline = async (question) => {
  return new Promise((resolve,reject) => {
    const max = 2
    let lines = []
    let esc = 0

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const addLine = (input) => {
      if (esc < max && !input) {
        esc += 1
        lines.push('')
        return
      } else if (esc === max) {
        rl.close()
        return
      }
      esc = 0
      lines.push(input)
    }

    rl.on('line', addLine)
    rl.on('close', () => {
      for (let i = 0; i < max; i++) {
        lines.pop()
      }
      const text = lines.join('\n')
      const html = markdown.toHTML(text)
      const data = {
        text,
        html,
      }
      resolve(data)
    })

    console.log(question)
    rl.prompt()
  })
}

const sendMessage = async (data) => {
  return new Promise((resolve,reject) => {
    mailgun.messages().send(data, (error,body) => {
      if (error) reject(error)
      resolve(body)
    })
  })
}

(async () => {
  const to = await ask('to')
  const from = await ask('from')
  const subject = await ask('subject')
  const body = await askMultiline('body')

  const message = {
    to,
    from,
    subject,
    ...body,
  }
  console.log(message)

  const send = await ask('send email? (y/N)')
  if (send === 'y') {
    const domain = from.match(/@(.\w+\.\w+)(\W|$)/)[1]
    mailgun = mailgun({
      apiKey,
      domain
    })
    const result = await sendMessage(message)
    console.log(result)
  }
})()
