from slowapi import Limiter
from slowapi.util import get_remote_address

# Kullanıcının IP adresine göre hız sınırı koyacak motor
limiter = Limiter(key_func=get_remote_address)