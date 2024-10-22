#!/usr/bin/env bash

curl --version &> /dev/null || { echo "curl could not be found; please install it"; exit 1; }
jq --version &> /dev/null || { echo "jq could not be found; please install it"; exit 1; }

[ -z "$EBW_SONAR_CREDENTIALS" ] && { echo "EBW_SONAR_CREDENTIALS is not set"; exit 1; }
[ -z "$EBW_INFLUXDB_TOKEN" ] && { echo "EBW_INFLUXDB_TOKEN is not set"; exit 1; }

[ -z "$EBW_SONAR_URL" ] && EBW_SONAR_URL="https://sonarqube.danielrogowski.net"
[ -z "$EBW_INFLUXDB_URL" ] && EBW_INFLUXDB_URL="http://ebookwizard.danielrogowski.net:8086"
[ -z "$EBW_INFLUXDB_ORG" ] && EBW_INFLUXDB_ORG="drogowski"
[ -z "$EBW_INFLUXDB_BUCKET" ] && EBW_INFLUXDB_BUCKET="ebookwizard"

EBW_SONAR_METRICS=code_smells,bugs,vulnerabilities,lines,ncloc,duplicated_lines_density,coverage,tests,test_errors,test_failures,
EBW_SONAR_METRICS+=skipped_tests,security_hotspots,reliability_rating,security_rating,sqale_rating,sqale_index,comment_lines,new_bugs,new_code_smells,
EBW_SONAR_METRICS+=new_vulnerabilities,violations,blocker_violations,critical_violations,major_violations,minor_violations,info_violations

EBW_SONAR_BACKEND_OUT=$(curl -s -XGET -u $EBW_SONAR_CREDENTIALS \
  $EBW_SONAR_URL/api/measures/component?component=ebookwizard-backend\&metricKeys=$EBW_SONAR_METRICS | \
  jq -r '.component.measures[] | "\(.metric) \(.value // .period.value)"')
EBW_SONAR_FRONTEND_OUT=$(curl -s -XGET -u $EBW_SONAR_CREDENTIALS \
  $EBW_SONAR_URL/api/measures/component?component=ebookwizard-frontend\&metricKeys=$EBW_SONAR_METRICS | \
  jq -r '.component.measures[] | "\(.metric) \(.value // .period.value)"')

echo "========== Metrics for backend =========="
echo "$EBW_SONAR_BACKEND_OUT"
echo "========== Metrics for frontend =========="
echo "$EBW_SONAR_FRONTEND_OUT"

EBW_INFLUXDB_BACKEND_DATA=$(echo "$EBW_SONAR_BACKEND_OUT" | awk '{printf "%s=%s,", $1, $2}' | sed 's/,$//')
EBW_INFLUXDB_FRONTEND_DATA=$(echo "$EBW_SONAR_FRONTEND_OUT" | awk '{printf "%s=%s,", $1, $2}' | sed 's/,$//')

EBW_GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")

echo "========== Writing backend stats to influxdb =========="
curl -X POST "$EBW_INFLUXDB_URL/api/v2/write?org=$EBW_INFLUXDB_ORG&bucket=$EBW_INFLUXDB_BUCKET&precision=s" \
  -H "Authorization: Token $EBW_INFLUXDB_TOKEN" \
  --data-raw "sonar_backend,branch=$EBW_GIT_BRANCH $EBW_INFLUXDB_BACKEND_DATA"
echo "Done..."

echo "========== Writing frontend stats to influxdb =========="
curl -X POST "$EBW_INFLUXDB_URL/api/v2/write?org=$EBW_INFLUXDB_ORG&bucket=$EBW_INFLUXDB_BUCKET&precision=s" \
  -H "Authorization: Token $EBW_INFLUXDB_TOKEN" \
  --data-raw "sonar_frontend,branch=$EBW_GIT_BRANCH $EBW_INFLUXDB_FRONTEND_DATA"
echo "Done..."
