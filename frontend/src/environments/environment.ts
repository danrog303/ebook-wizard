const environment = {
    // Links for language switching
    "FRONTEND_BASE_URI_PL": "http://localhost:4200",
    "FRONTEND_BASE_URI_EN": "http://localhost:4200",

    // Frontend configuration for links building
    "API_BASE_URI": "http://192.168.32.7:8080",

    // Recaptcha configuration
    "RECAPTCHA_SITE_KEY": "6LdX6ewpAAAAADI2jjWT-mzbTAt5gDzdMlztWjPv",

    // AWS Cognito configuration
    "COGNITO_USER_POOL_ID": "eu-central-1_wDhQfssGC",
    "COGNITO_PUBLIC_CLIENT_ID": "2k064lbfguou7l8pcg0t1njfdp",

    // Domain for configuring AWS Amplify cookie authentication store
    // Leave empty for development (localhost)
    "AUTH_DOMAIN": ""
};

export default environment;
