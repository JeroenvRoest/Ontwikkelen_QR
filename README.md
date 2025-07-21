# QR Scanner Zorgcentrum Anker

Deze HTML-webapplicatie scant QR-codes en haalt cliëntgegevens op via een mockversie van de ONS API. De mock-API wordt opgezet in Postman met behulp van de bijgeleverde collectie.

## Inhoud

- [Beschrijving](#beschrijving)
- [Vereisten](#vereisten)
- [Installatie en ontwikkeling](#installatie-en-ontwikkeling)
- [Mock API opzetten in Postman](#mock-api-opzetten-in-postman)
- [Aanpassen van de API-link in de HTML](#aanpassen-van-de-api-link-in-de-html)
- [Structuur van de repository](#structuur-van-de-repository)
- [Licentie](#licentie)

## Beschrijving

De applicatie maakt gebruik van een QR-scanner (camera) om een ID op te halen. Met dat ID wordt vervolgens een GET-verzoek gedaan naar de mock ONS API om cliëntinformatie op te vragen.

## Vereisten

- Een moderne browser (met cameratoegang)
- [Postman](https://www.postman.com/downloads/)
- Bestand: `ONS API.postman_collection.json` (zit in deze repository)

## Installatie en ontwikkeling

1. Clone deze repository of download het ZIP-bestand:

##  Mock API opzetten in Postman
Volg deze stappen om de ONS API lokaal te simuleren met Postman:

## 1. Importeer de collectie
Open Postman.

1. Klik linksboven op Import.
2. Kies voor File.
3. Selecteer het bestand ONS API.postman_collection.json uit deze repository.
4. Klik op Import.

## 2. Maak een mock server aan
Klik op de drie puntjes (⋮) naast de geïmporteerde collectie "ONS API".

1. Kies Mock Collection.
2. Voer de volgende instellingen in:
3. Name: ONS API Mock
4. Select a collection: ONS API
5. Save responses: Aan (ingeschakeld)
6. Visibility: Kies "Public" of "Private" naar keuze
7. Klik op Create Mock Server.
8. Postman toont nu een mock URL,
   Kopieer deze URL — je hebt hem nodig in de volgende stap.

## Aanpassen van de API-link in de HTML
Na het opzetten van de mockserver in Postman moet je de link in de HTML-code aanpassen zodat de applicatie gegevens ophaalt van de juiste API.

Stappen:
1. zoek in de .JS bestanden naar de plaatsen waar de API wordt aangeroepen. (deze plekken zijn voorzien van comments met daarin API dit kan helpen met het vinden van deze regels).
(een voorbeeld is: https://1a2480b0-fd9b-48ad-bfa8-f417948043b0.mock.pstmn.io/t/clients/${clientId}/medical_notes)
2. in bovenstaand voorbeeld vervang alles behalve /t/clients/${clientId}/medical_notes voor de gekopieerde link van Postman.
3. als de postman serverdraait zal nu de applicatie de requests door sturen naar de nieuwe server.
