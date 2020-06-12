## MAILGUN CLI

A Node-based Mailgun CLI for quick sending prompted test emails. Supports Markdown input for message bodies.

1. Copy _.env.example_ to _.env_ and configure
2. Run with `npm start`
3. Follow the prompts
  - **from** email address should be from a domain hosted by your Mailgun account. Can be formed as either:
    - `username@yourdomain.com`
    - `Friendly Name <username@yourdomain.com>`
  - **body** of the email should be entered in markdown format, both `text` and `html` versions are supplied to Mailgun.
    - three empty lines (return) will exit the body editor
  - **attachments** can be supplied as _relative/path/to/file_
    - empty line (return) quit attachment prompt
    - `DEFAULT_ATTACHMENTS` environment variable should be a comma-separated string of relative filepaths
4. Confirm to send
