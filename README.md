# ebook-wizard
![ci status badge](https://github.com/danrog303/ebook-wizard/actions/workflows/build.yml/badge.svg)
[![codecov badge](https://codecov.io/gh/danrog303/ebook-wizard/branch/main/graph/badge.svg?token=K2RFB9J6CR)](https://codecov.io/gh/danrog303/ebook-wizard)
> Web platform for advanced ebook management

Polish wersion of README file 🇵🇱 [is available here](https://github.com/danrog303/ebook-wizard/blob/main/README.pl.md). 

## ℹ️ What is ebook-wizard?
Ebook-wizard is an application that can be classified as a “cloud drive for ebooks.” Using this application, you can store ebooks on a remote server, convert them between supported formats, make metadata modifications, view ebook content, and share ebooks with other users. It also allows you to create ebooks from scratch using an interactive online editor.  

Ebook-wizard supports the following ebook file formats: epub, mobi, azw3, html, pdf, docx, txt

## ⚙️ Technology used
**Frontend:**
- **Programming language**: Typescript
- **Framework**: Angular
- **Styling**: Angular Material, SASS stylesheets
- **Authentication**: AWS Cognito

**Backend:**
- **Programming language**: Java
- **Framework**: Spring
- **Authentication**: AWS Cognito
- **System dependencies**: Pandoc, Calibre project libs

## 🛠️ How to run?
### Backend building
To build backend, you need to have JDK 21 (Java Development Kit) installed.
```
cd backend/
./mvnw clean package  # compile the application and run unit tests
```
To run the backend server, use:
```
cd backend/
java -jar "target/ebookwizard-1.0.0.jar"
```

Backend server requires a couple of environment variables in order to work:  

| Variable Name                   | Description                                                                                   | Required | Example                                                                                     |
|---------------------------------|-----------------------------------------------------------------------------------------------|----------|---------------------------------------------------------------------------------------------|
| `EBW_AWS_ACCESS_KEY`            | AWS access key, required for AWS integration                                                  | Yes      | `xxxxxxxxxxxxxxxxxxxx`                                                                      |
| `EBW_AWS_SECRET_KEY`            | AWS secret key, required for AWS integration                                                  | Yes      | `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`                                                        |
| `EBW_AWS_REGION`                | AWS default region, required for AWS integration                                              | Yes      | `eu-central-1`                                                                              |
| `EBW_AWS_S3_BUCKET_NAME`        | AWS S3 bucket name, required for file storage module                                          | Yes      | `my-s3-bucket`                                                                              |
| `EBW_MAIL_SES_SOURCE_ARN`       | ARN identifier of AWS SES email source; required for sending email messages                   | Yes      | `arn:aws:ses:eu-central-1:123456789012:identity/example.com`                                |
| `EBW_MONGO_CONNECTION_STRING`   | MongoDB database connection string, required to connect with the database                     | Yes      | `mongodb://username:password@host:port/db`                                                  |
| `EBW_AWS_COGNITO_POOL_ID`       | Identifier of user pool in AWS Cognito; required for authentication module                    | Yes      | `eu-central-1_xxxxxxx`                                                                      |
| `EBW_OAUTH2_ISSUER_URI`         | Issuer URI provided by AWS Cognito, required for authentication to work                       | Yes      | `https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_xxxxxxx`                       |
| `EBW_OAUTH2_JWK_URI`            | JWK URI provided by AWS Cognito, required for authentication to work                          | Yes      | `https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_xxxxxxx/.well-known/jwks.json` |
| `EBW_SQS_CONVERSION_QUEUE_URL`  | Queue URL provided by AWS SQS, required for task queue to work                                | Yes      | `https://sqs.eu-central-1.amazonaws.com/123456789012/conversion-queue.fifo`                 |
| `EBW_SQS_EMAIL_QUEUE_URL`       | Queue URL provided by AWS SQS, required for task queue to work                                | Yes      | `https://sqs.eu-central-1.amazonaws.com/123456789012/email-queue.fifo`                      |

### Frontend building
Before building frontend, you'll need to provide environment variables. 
You can do it by modifying **frontend/src/environments/environment.ts** file.

| Variable Name               | Description                                              | Required | Example URL/Value                                        |
|-----------------------------|----------------------------------------------------------|----------|----------------------------------------------------------|
| `FRONTEND_BASE_URI_PL`      | Base URI for the Polish version of the frontend          | Yes      | `https://pl.ebookwizard.danielrogowski.net`              |
| `FRONTEND_BASE_URI_EN`      | Base URI for the English version of the frontend         | Yes      | `https://en.ebookwizard.danielrogowski.net`              |
| `API_BASE_URI`              | Base URI for the ebook-wizard api                        | Yes      | `https://api.ebookwizard.danielrogowski.net`             |
| `RECAPTCHA_SITE_KEY`        | Site key for Google reCAPTCHA                            | Yes      | `6LdX6ewpAAAAADI2jjWT-mzbTAt5gDzdMlztWjPv`               |
| `COGNITO_USER_POOL_ID`      | AWS Cognito User Pool ID                                 | Yes      | `eu-central-1_wDhQfssGC`                                 |
| `COGNITO_PUBLIC_CLIENT_ID`  | AWS Cognito Public Client ID                             | Yes      | `2k064lbfguou7l8pcg0t1njfdp`                             |
| `AUTH_DOMAIN`               | Domain for AWS Amplify cookie authentication store       | No       | `.ebookwizard.danielrogowski.net`                        |


To build and run frontend, you need to have [Angular CLI](https://v17.angular.io/cli) installed.
```
cd frontend/
npm i --force  # installs dependencies
ng build --configuration production  # builds the frontend
```

To run frontend in a development server, run: 
```
cd frontend/
ng serve
```

## 🏗️ Application structure
When you use the ebook-wizard web application, you connect to the frontend server. The frontend layer takes care of data presentation and direct interaction with the end user. When the user orders the execution of a specific operation (for example, displaying an ebook), the corresponding query is sent to the backend, which handles the actual execution of the task. The backend, as a result of the query, can perform one of several actions:  
- read or write to the MongoDB database  
- add the action to the queue using AWS SQS  
- sending an email message using AWS SES  
- writing or reading a file from the AWS S3 service
  
![app-components-diagram drawio](https://github.com/user-attachments/assets/2590fe94-0e4e-495b-8d5b-9af31a970512)

## 🖼️ Screenshots
**Main page:**  
<img src="https://github.com/user-attachments/assets/4a0c1973-9ca2-4307-9107-97b64c321a80" alt="alt text" width="700px">  
**Projects editor home page:**  
<img src="https://github.com/user-attachments/assets/e9ddec53-b536-4324-b3fc-3f99c41bd7cb" alt="alt text" width="700px">
