# ebook-wizard
![ci status badge](https://github.com/danrog303/ebook-wizard/actions/workflows/build.yml/badge.svg)
[![codecov badge](https://codecov.io/gh/danrog303/ebook-wizard/branch/main/graph/badge.svg?token=K2RFB9J6CR)](https://codecov.io/gh/danrog303/ebook-wizard)
> Platforma internetowa do tworzenia, edytowania i konwertowania e-booków

Angielska wersja pliku README 🇬🇧 [jest dostępna tutaj](https://github.com/danrog303/ebook-wizard/blob/main/README.md). 

## ℹ️ What is ebook-wizard?
Ebook-wizard to aplikacja, którą można zakwalifikować jako “dysk w chmurze do przechowywania ebooków”. Korzystając z Ebook-wizard, użytkownik może przechowywać ebooki na zdalnym serwerze, konwertować je między obsługiwanymi formatami, modyfikować ich metadane, przeglądać treść ebooków oraz udostępniać je innym użytkownikom. Aplikacja umożliwia także tworzenie ebooków od podstaw, korzystając z interaktywnego edytora online.

Ebook-wizard obsługuje następujące formaty plików: epub, mobi, azw3, html, pdf, docx, txt.

## ⚙️ Wykorzystywane technologie
**Frontend:**
- **Język programowania**: Typescript
- **Framework**: Angular
- **Wygląd**: Angular Material, arkusze styli SASS
- **Uwierzytelnianie**: AWS Cognito

**Backend:**
- **Język programowania**: Java
- **Framework**: Spring
- **Uwierzytelnianie**: AWS Cognito
- **Zależności systemowe**: Pandoc, biblioteki projektu Calibre

## 🛠️ Instrukcja uruchomienia?
### Budowanie backendu
Aby zbudować backend, należy najpierw zainstalować JDK 21 (Java Development Kit).
```
cd backend/
./mvnw clean package  # kompiluje aplikację i uruchamia testy jednostkowe
```
Aby uruchomić aplikację backendową, należy wykonać następujące polecenie:
```
cd backend/
java -jar "target/ebookwizard-1.0.0.jar"
```

Serwer backendowy wymaga do działania kilku zmiennych środowiskowych. Zawartość tych zmiennych (ze względów bezpieczeństwa) nie jest dołączona do repozytorium.

| Nazwaw zmiennej                 | Opis                                                                                          | Wymagana | Przykład                                                                                    |
|---------------------------------|-----------------------------------------------------------------------------------------------|----------|---------------------------------------------------------------------------------------------|
| `EBW_AWS_ACCESS_KEY`            | Klucz dostępu AWS, wymagany aby integracja z zasobami AWS działała poprawnie                  | Tak      | `xxxxxxxxxxxxxxxxxxxx`                                                                      |
| `EBW_AWS_SECRET_KEY`            | Klucz tajny AWS, wymagany aby integracja z zasobami AWS działała poprawnie                    | Tak      | `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`                                                        |
| `EBW_AWS_REGION`                | Region zasobów AWS, wymagany aby integracja z zasobami AWS działała poprawnie                 | Tak      | `eu-central-1`                                                                              |
| `EBW_AWS_S3_BUCKET_NAME`        | Nazwa kontenera plików AWS S3, wymagana dla modułu przechowywania plików                      | Tak      | `my-s3-bucket`                                                                              |
| `EBW_MAIL_SES_SOURCE_ARN`       | Identyfikator ARN źródła e-mail w AWS SES; wymagany do wysyłania wiadomości e-mail	          | Tak      | `arn:aws:ses:eu-central-1:123456789012:identity/example.com`                                |
| `EBW_MONGO_CONNECTION_STRING`   | "Connection string" do bazy danych MongoDB, wymagany do połączenia z bazą danych	          | Tak      | `mongodb://username:password@host:port/db`                                                  |
| `EBW_AWS_COGNITO_POOL_ID`       | Identyfikator puli użytkowników w AWS Cognito; wymagany dla modułu uwierzytelniania	          | Tak      | `eu-central-1_xxxxxxx`                                                                      |
| `EBW_OAUTH2_ISSUER_URI`         | URI wydawcy kluczy dostarczony przez AWS Cognito, wymagany dla modułu uwierzytelniania        | Tak      | `https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_xxxxxxx`                       |
| `EBW_OAUTH2_JWK_URI`            | URI klucza JWK dostarczony przez AWS Cognito, wymagany dla modułu uwierzytelniania            | Tak      | `https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_xxxxxxx/.well-known/jwks.json` |
| `EBW_SQS_CONVERSION_QUEUE_URL`  | URL kolejki dostarczony przez AWS SQS, wymagany do działania kolejki zadań	                  | Tak      | `https://sqs.eu-central-1.amazonaws.com/123456789012/conversion-queue.fifo`                 |
| `EBW_SQS_EMAIL_QUEUE_URL`       | URL kolejki dostarczony przez AWS SQS, wymagany do działania kolejki zadań	                  | Tak      | `https://sqs.eu-central-1.amazonaws.com/123456789012/email-queue.fifo`                      |

### Budowanie frontendu
Przed zbudowaniem backendu należy uzupełnić zmienne środowiskowe. 
Można to zrobić poprzez modyfikację pliku **frontend/src/environments/environment.ts**.

| Nazwa zmiennej              | Opis                                                     | Wymagana | Przykładowa wartość                                      |
|-----------------------------|----------------------------------------------------------|----------|----------------------------------------------------------|
| `FRONTEND_BASE_URI_PL`      | Base URI for the Polish version of the frontend          | Tak      | `https://pl.ebookwizard.danielrogowski.net`              |
| `FRONTEND_BASE_URI_EN`      | Base URI for the English version of the frontend         | Tak      | `https://en.ebookwizard.danielrogowski.net`              |
| `API_BASE_URI`              | Base URI for the ebook-wizard api                        | Tak      | `https://api.ebookwizard.danielrogowski.net`             |
| `RECAPTCHA_SITE_KEY`        | Site key for Google reCAPTCHA                            | Tak      | `6LdX6ewpAAAAADI2jjWT-mzbTAt5gDzdMlztWjPv`               |
| `COGNITO_USER_POOL_ID`      | AWS Cognito User Pool ID                                 | Tak      | `eu-central-1_wDhQfssGC`                                 |
| `COGNITO_PUBLIC_CLIENT_ID`  | AWS Cognito Public Client ID                             | Tak      | `2k064lbfguou7l8pcg0t1njfdp`                             |
| `AUTH_DOMAIN`               | Domain for AWS Amplify cookie authentication store       | Nie      | `.ebookwizard.danielrogowski.net`                        |


Aby zbudować lub uruchomić frontend, należy wcześniej zainstalować zestaw narzędzi [Angular CLI](https://v17.angular.io/cli).
```
cd frontend/
npm i --force  # instaluje zależności
ng build --configuration production  # buduje frontend
```

Aby uruchomić serwer deweloperski, należy wykonać następujące polecenia: 
```
cd frontend/
ng serve
```

## 🏗️ Struktura aplikacji
Gdy użytkownik korzysta z aplikacji, łączy się z serwerem frontend. Warstwa frontendowa zajmuje się prezentacją danych i bezpośrednią interakcją z użytkownikiem. Gdy użytkownik zażąda wykonania określonej operacji (na przykład, wyświetlenia e-booka), odpowiednie zapytanie zostaje wysłane do backendu, który zajmuje się właściwym przetworzeniem operacji. Backend, jako rezultat operacji, może podjąć jedną z kilku wybranych akcji:
- odczyt lub zapis do bazy MongoDB
- zakolejkowanie operacji przy użyciu AWS SQS
- wysłanie wiadomości mailowej przy użyciu AWS SES
- zapis lub odczyt pliku w usłudze AWS S3
  
![app-components-diagram drawio](https://github.com/user-attachments/assets/2590fe94-0e4e-495b-8d5b-9af31a970512)

## 🖼️ Zrzuty ekranu
**Main page:**  
<img src="https://github.com/user-attachments/assets/4a0c1973-9ca2-4307-9107-97b64c321a80" alt="alt text" width="700px">  
**Projects editor home page:**  
<img src="https://github.com/user-attachments/assets/e9ddec53-b536-4324-b3fc-3f99c41bd7cb" alt="alt text" width="700px">
