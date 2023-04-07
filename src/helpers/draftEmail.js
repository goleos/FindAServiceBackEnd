const draftEmail = (name, link) => {
  return `<body style="font-family: sans-serif">
  <p>Dear ${name},</p>
  <p>Thank you for signing up for FindAService. Before you can start using our platform, we need to verify your email address.</p>
  <p>Please click the link below to verify your email address:</p>
  <div style="width: 100px; margin: 0 auto">
  <p><a href="${link}" style="">
    <button
        style="background-color: #4D4AE8; border: 1px solid #4D4AE8;border-radius: 1rem; color: #FFFFFF; margin: 0;
        padding: .5rem 1rem; cursor: pointer; font-size: 1rem; background-image: linear-gradient(180deg, rgba(255, 255,
        255, .15), rgba(255, 255, 255, 0));
        box-shadow: rgba(255, 255, 255, 0.15) 0 1px 0 inset,rgba(46, 54, 80, 0.075) 0 1px 1px;">
        Verify
      </button>
    </a>
  </p>
  </div>
  <p>If you did not sign up for FindAService, please ignore this email.</p>
  <p>Thank you for using FindAService.</p>
  <p>Best regards,<br>
  FindAService Team</p>
</body>`
}

module.exports = draftEmail