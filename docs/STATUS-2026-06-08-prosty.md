# Status projektu — 8 czerwca 2026

_Raport prostym językiem. Oparty na faktach z bieżącego stanu prac._

## 1. W skrócie
System do akredytacji prasowej i wpuszczania gości na wydarzenia jest **na późnym etapie** — większość funkcji działa i jest przetestowana na bieżąco. Zostało domknięcie kilku rzeczy i jeden pełny test „od początku do końca", zanim oficjalnie go uruchomimy.

## 2. Co już działa
- **Zaproszenia z kodem QR.** Gość po zatwierdzeniu dostaje maila z linkiem do swojej przepustki i kodem QR.
- **Każdy gość ma własny, unikalny numer.** System sam nadaje 10-cyfrowy kod — nie da się go pomylić ani powielić między gośćmi.
- **Skanowanie telefonem przy wejściu.** Obsługa skanuje kod QR kamerą telefonu i od razu widzi wynik.
- **Działa też bez internetu.** Przed wydarzeniem system pobiera listę gości na urządzenie, więc przy bramce skanowanie działa nawet, gdy sieć siądzie — a skany „dogrywają się", gdy internet wróci.
- **Czytelny wynik skanu.** Po zeskanowaniu pojawia się duży, kolorowy komunikat: zielony = wpuść, żółty = uwaga (np. ktoś już wszedł), czerwony = odmowa (z powodem). Zostaje na ekranie, aż obsługa kliknie „Skanuj kolejnego" — nie znika sam, więc nic nie umknie.
- **Skaner wygodny na telefonie.** Układ dopasowany do małego ekranu, podgląd kamery duży, kwadratowy i jasny — łatwo trafić w kod.
- **Podgląd kodu QR gościa w panelu.** Organizator może podejrzeć i pokazać kod konkretnego gościa (wcześniej wszyscy widzieli ten sam obrazek — naprawione).
- **Logowanie działa poprawnie.** Enter i autouzupełnianie hasła logują (wcześniej omyłkowo otwierały okno zmiany hasła).
- **Panel organizatora** do obsługi zgłoszeń, decyzji i listy gości.
- **Etykieta wersji w rogu ekranu** — drobiazg, ale ułatwia testowanie (od razu wiadomo, którą wersję się ogląda).

## 3. Co zostało do uruchomienia (Wersja 1)
- **Pełny test „od początku do końca"** — przejście całej drogi: zgłoszenie → zatwierdzenie → mail z QR → wejście przez skan → raport. Tego jeszcze nie zrobiliśmy w jednym ciągu; to ostatni duży sprawdzian.
- **Dostęp do skanera dla obsługi bramki** — dziś skaner mogą otwierać tylko organizatorzy. Trzeba zdecydować, jak wpuszczać osoby z obsługi (szybkie konta dla bramki teraz, czy osobny „kod skanera" później). To krótka zmiana po podjęciu decyzji.
- **⏳ Czeka na: konfigurację wysyłki maili.** Żeby maile z przepustkami realnie wychodziły na produkcji, trzeba podpiąć usługę pocztową i adres systemu — to wymaga ustawień poza samym kodem (klucze, adres). Zależy od dostępów, nie od programowania.
- **⏳ Czeka na: dodatkowe narzędzie u nas (jednorazowa instalacja)** potrzebne, by dopiąć kilka rzeczy w bazie danych przed startem.
- **Scalenie w jedną gotową wersję i uruchomienie.** Prace toczą się na wersji roboczej; po teście trzeba je scalić w wersję główną i włączyć produkcyjnie.

## 4. Co planujemy potem (Wersja 2)
- Usprawnienia jakości i niezawodności pod większy ruch.
- Automatyczne przypomnienia (np. o przesłaniu relacji/coverage).
- Porządki w statystykach (liczniki organizatora) tak, by zawsze się zgadzały.
- Twardsze zabezpieczenia formularzy publicznych przed nadużyciami.
- Więcej automatycznych testów, żeby kolejne zmiany niczego nie psuły.

## 5. Ile to potrwa
**Co liczę jako „uruchomienie Wersji 1":** ostatni pełny test, podpięcie wysyłki maili, scalenie prac w jedną wersję i włączenie produkcyjnie.

Przy obecnym tempie pracy (pracujemy zrywami — kilka mocnych dni w tygodniu):
- **Optymistycznie: ~1 tydzień** — jeśli ustawienia maili i dostępy są gotowe od ręki, a test przejdzie bez niespodzianek.
- **Realnie: ~2–3 tygodnie** — uwzględniając czas na ustawienia zewnętrzne i drobne poprawki, które zwykle wychodzą przy pierwszym pełnym teście.
- **Pesymistycznie: ~4–6 tygodni** — jeśli pełny test ujawni więcej do poprawienia albo ustawienia/dostępy się przeciągną.

**Co najbardziej może przesunąć termin:**
1. **Konfiguracja wysyłki maili** (klucze, adres) — zależy od dostępów; bez tego nie zamkniemy testu maila i wejścia.
2. **Pierwszy pełny test** — to moment, w którym mogą wyjść drobne usterki widoczne dopiero „na żywo" (jak wcześniej czarny podgląd kamery), niewidoczne we wcześniejszych, automatycznych sprawdzeniach.
3. **Porządki w bazie danych** przed startem — wymagają tego jednorazowego narzędzia i ostrożności.

## Czego dziś nie da się ocenić — uczciwie
- Czy maile są już podpięte na produkcji i czy strona produkcyjna ma najnowszą wersję — tego nie widać z samych prac programistycznych; wymaga sprawdzenia po stronie usług.
- Jak system zachowa się na realnym wydarzeniu i sprzęcie obsługi — to pokaże dopiero pełny test na żywo.
