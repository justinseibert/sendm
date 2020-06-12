## MAILGUN CLI

A Node-based Mailgun CLI for quick sending prompted test emails. Supports Markdown input for message bodies.

1. Copy _.env.example_ to _.env_ and configure
2. Run with `npm start`
3. Follow the prompts
  - Use a "from" email address with a domain hosted by your Mailgun account. Can be formed as either:
    - `username@domain.com`
    - `Friendly Name <username@domain.com>`
  - "body" of the email should be entered in markdown format, both `text` and `html` versions are supplied to Mailgun.
    - three empty lines (return) will exit the body editor
4. Confirm to send