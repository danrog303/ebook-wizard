variable backend_instance_type {
    description = "Elastic Beanstalk: EC2 instance type for backend environment"
    type = string
    default = "t2.micro"
}

variable backend_solution_stack_name {
    description = "Elastic Beanstalk: Solution stack name for backend environment"
    type = string
    default = "64bit Amazon Linux 2023 v4.2.4 running Corretto 21"
}

variable backend_jvm_options {
    description = "Elastic Beanstalk: JVM options for backend environment"
    type = string
    default = "-Xmx512m -Xms256m"
}

variable backend_aws_secret_key {
    description = "AWS Secret Key for backend environment"
    type = string
}

variable backend_aws_access_key {
    description = "AWS Access Key for backend environment"
    type = string
}

variable "backend_cognito_pool_id" {
    description = "Cognito Pool ID for backend environment"
    type = string
}

variable "backend_aws_region" {
    description = "AWS Region for backend environment"
    type = string
    default = "eu-central-1"
}

variable "backend_s3_bucket_name" {
    description = "S3 Bucket Name for backend environment"
    type = string
}

variable "backend_mongo_connection_string" {
    description = "MongoDB Connection String for backend environment"
    type = string
}

variable "backend_sqs_email_queue_url" {
    description = "SQS Email Queue URL for backend environment"
    type = string
}

variable "backend_sqs_conversion_queue_url" {
    description = "SQS Conversion Queue URL for backend environment"
    type = string
}

variable "backend_oauth2_jwk_uri" {
    description = "OAuth2 JWK URI for backend environment"
    type = string
}

variable "backend_oauth2_issuer_uri" {
    description = "OAuth2 Issuer URI for backend environment"
    type = string
}

variable "backend_mail_ses_source_arn" {
    description = "Mail SES Source ARN for backend environment"
    type = string
}
