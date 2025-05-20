# BurgerHouse

BurgerHouse je web aplikacija rađena u c# .netu i reactjs kao bazu koristi redis iz dockera. Aplikacija nudi:

- Prijava i odjava.
- Meni sa hranom i pićem.
- Online uplaćivanje novca na web aplikaciju putem PayPala i naručivanje stavki iz menija i pregled obrađenih narudžbina (RealTime).
- Radnicima je omogućen pregled narudžbina i obrada istih (Pub/Sub mehanizam redisa , RealTime).
- Unos novih stavki na meni.

# Uputstvo za pokretanje

- U Redis radnom direktorijumu kopirajte dump.rdb fajl. (ukoliko ne znate koji je to direktorijum pokrenite container koji sadrzi redis , pokrenite redis-cli i ukucajte config get dir ,u mom slučaju piše /data, potom i stopirajte kontejner)
- Kopiranje vršite komandom : docker cp C:\Users\Nemanja\Desktop\dump.rdb redis-container:/data/dump.rdb. (naravno, postavite vašu putanju do dump.rdb fajla(onog kojeg ste dobili sa git clone) i umesto redis-container upišite ili ime vašeg kontejnera ili njegov identifikator)
- Pokrenite redis kontejner komandnom docker start ime_redis_kontejnera ili docker start id_vašeg_kontejnera.
- Backend se pokreće tako sto otvorite terminal u backend folder u ukucate sledeću komandu : dotnet run (ili dotnet watch run ako želite pristup swaggeru)
- Frontend se pokreće tako što otvorite terminal u frontend folder u ukucate sledeće komande ovim redosledom :npm install , npm audit fix (ove dve komande samo prvog puta) i na kraju npm run dev , za pokretanje samog frontenda.

# Podaci

- Kada unesete podatke (koraci 1-3 uputstva za pokretanje imaćete pristup sledećim nalozima):

admin redis:

gmail : nikola@gmail.com
password : nikola123!

user redis:

gmail : m.sava017@gmail.com
password : sava123!

worker redis:

gmail : peraperic@gmail.com
password : pera123!

- Za simulaciju plaćanja putem paypala koristite sledeći nalog
  gmail : sb-qbg43i33181803@personal.example.com
  password : NVU,2bi-
