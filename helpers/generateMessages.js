export function GenerateWelcomeText(name, url) {
  return `Hi ${name},
  
  Welcome to Arbaz-SMP, we're glad to have you 🎉🙏
  
  We're all a big family here, so make sure to upload your user photo so we get to know you a bit better!
  
  Upload user photo: ${url}
  
  If you need any help please don't hesitate to contact me!
  
  - Arbaz Shoukat, CEO
  
  
  
  `;
}

export function GenerateForgotPasswordText(name, url) {
  return `Hi ${name}!
  
  Forgot your password 🤦‍♂️? 
  
  Submit a patch request with your new password and confirm passwrod to this url below.
  
  ${url}
  
  And if you did not send this request then please ignore this!`;
}

export function GenerateConfirmEmailText(name, url) {
  return `Hi ${name},
  
  Welcome to Arbaz-SMP, we're glad to have you 🎉🙏
  
  Please confirm your email: ${url}
  
  If you need any help please don't hesitate to contact me!
  
  - Arbaz Shoukat, CEO
  
  
  
  `;
}
