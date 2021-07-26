require('dotenv').config()
const path = require('path')
const readline = require('readline')
const markdown = require( 'markdown' ).markdown
let mailgun = require('mailgun-js')

const apiKey = process.env.MAILGUN_API_KEY

const ask = async (question, default_input='') => {
  question = default_input ? `${question} [${default_input}]: ` : `${question}: `
  return new Promise((resolve,reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(question, (value) => {
      value = value || default_input
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
      const text = lines.join('\n') || ' '
      const html = markdown.toHTML(text) || ' '
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

const askAttachments = async (question, attachments) => {
  const filepath = await ask(`${question} [${attachments.length} file${attachments.length > 1 ? 's' : ''}]`)
  if (filepath) {
    const attachment = path.join(__dirname, filepath.trim())
    attachments.push(attachment)
    return askAttachments(question, attachments)
  }
  return attachments
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
  const to = await ask('to', process.env.DEFAULT_TO)
  const from = await ask('from', process.env.DEFAULT_FROM)
  const subject = await ask('subject', process.env.DEFAULT_SUBJECT)
  const body = await askMultiline('body (markdown)')

  let default_attachments = []
  if (process.env.DEFAULT_ATTACHMENTS) {
    default_attachments = process.env.DEFAULT_ATTACHMENTS.split(',')
  }
  const attachment = await askAttachments('add attachment (path/to/file)', default_attachments)

  const message = {
    to,
    from,
    subject,
    ...body,
    attachment,
  }
  console.log(message)

  const send = await ask('send email? [y/N]')
  if (send === 'y') {
    const domain = process.env.DEFAULT_DOMAIN || from.match(/@(\w+[^>]*)(\W|$)/)[1]
    mailgun = mailgun({
      apiKey,
      domain
    })
    const result = await sendMessage(message)
    console.log(result)
  }
})()
