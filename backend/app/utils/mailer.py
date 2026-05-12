import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional

class LuniaMailer:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com" # Örnektir
        self.default_text = "Sektörel uygulamalarımızı ve üretim kalitemizi detaylıca incelemek isterseniz, ekte sunduğumuz güncel portfolyomuza göz atabilirsiniz."

    async def send_auth_mail(
        self, 
        to_email: str, 
        subject: str, 
        body: str, 
        cc: Optional[List[str]] = None, 
        bcc: Optional[List[str]] = None
    ):
        msg = MIMEMultipart()
        msg['From'] = "noreply@lunia.ai"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        if cc: msg['Cc'] = ", ".join(cc)
        # BCC teknik olarak başlıkta (header) görünmez
        
        full_body = f"{body}\n\n---\n{self.default_text}"
        msg.attach(MIMEText(full_body, 'plain'))
        
        # SMTP gönderim mantığı buraya gelecek...
        print(f"📧 Mail gönderildi: {to_email} | CC: {cc} | BCC: {bcc}")