import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

class LuniaMailer:
    def __init__(self):
        self.sender_email = os.getenv("SMTP_USER")
        self.password = os.getenv("SMTP_PASSWORD")
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))

    def send_reset_password_email(self, target_email: str, token: str):
        # Canlıya çıkınca burası gerçek frontend URL'si olacak
        reset_link = f"http://localhost:3000/reset-password?token={token}"
        
        subject = "Lunia.ai - Şifre Sıfırlama Talebi"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4A90E2;">Selam Yoldaş,</h2>
                <p>Lunia.ai hesabının şifresini sıfırlamak için bir talep aldık.</p>
                <p>Eğer bu talebi sen yapmadıysan bu e-postayı görmezden gelebilirsin. Şifreni sıfırlamak için aşağıdaki butona tıkla:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="background-color: #4A90E2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Şifremi Sıfırla</a>
                </div>
                <p>Ya da bu linki tarayıcına yapıştır: <br> {reset_link}</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 0.8em; color: #888;">Lunia.ai - Dijital Sorun Ortağın</p>
            </body>
        </html>
        """
        
        msg = MIMEMultipart()
        msg['From'] = f"Lunia.ai <{self.sender_email}>"
        msg['To'] = target_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.password)
                server.send_message(msg)
            print(f"📧 E-posta başarıyla gönderildi: {target_email}")
            return True
        except Exception as e:
            print(f"❌ E-posta gönderim hatası: {e}")
            return False