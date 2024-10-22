#!/usr/bin/env bash

if [ "$EUID" -ne 0 ]; then 
    echo "Root permissions are required for importing the certificate"
    exit 1
fi

[ -z "$EBW_SONAR_TOKEN_BACKEND" ] && { echo "EBW_SONAR_TOKEN_BACKEND is not set"; exit 1; }
[ -z "$EBW_SONAR_TOKEN_FRONTEND" ] && { echo "EBW_SONAR_TOKEN_FRONTEND is not set"; exit 1; }
[ -z "$JAVA_HOME" ] && { echo "JAVA_HOME is not set"; exit 1; }
openssl help &> /dev/null || { echo "openssl could not be found; please install it"; exit 1; }
$JAVA_HOME/bin/keytool &> /dev/null || { echo "keytool (java) could not be found; please install it"; exit 1; }

echo $PATH
sonar-scanner --version
sonar-scanner --version &> /dev/null || { echo "sonar-scanner could not be found; please install it"; exit 1; }

if [ -z "$EBW_SONAR_URL" ]; then
    EBW_SONAR_URL="sonarqube.danielrogowski.net"
fi

echo "Downloading sonarqube HTTPS certificate"
echo | openssl s_client -connect $EBW_SONAR_URL:443 -servername $EBW_SONAR_URL | openssl x509 -outform PEM > sonar_https.crt

echo "Adding sonarqube HTTPS certificate to Java keystore"
$JAVA_HOME/bin/keytool -delete -alias sonarqube -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit
$JAVA_HOME/bin/keytool -import -alias sonarqube -keystore $JAVA_HOME/lib/security/cacerts -file sonar_https.crt -storepass changeit -noprompt

echo "Running backend analysis"
cd ../backend
./mvnw sonar:sonar -Dsonar.token=$EBW_SONAR_TOKEN_BACKEND

echo "Running frontend analysis"
cd ../frontend
sonar-scanner -Dsonar.token=$EBW_SONAR_TOKEN_FRONTEND -X
