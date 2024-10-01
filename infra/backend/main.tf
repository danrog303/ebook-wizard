resource "aws_elastic_beanstalk_application" "backend_app" {
  name        = "ebook-wizard-${terraform.workspace}"
}

resource "aws_elastic_beanstalk_environment" "backend_environment" {
  name                = "ebook-wizard-${terraform.workspace}-env"
  application         = aws_elastic_beanstalk_application.backend_app.name
  solution_stack_name = var.backend_solution_stack_name
  version_label = aws_elastic_beanstalk_application_version.backend_version.name
  wait_for_ready_timeout = "60m"
  
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = "aws-elasticbeanstalk-service-role"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name = "IamInstanceProfile"
    value = "aws-elasticbeanstalk-ec2-role"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "JVM_OPTIONS"
    value     = var.backend_jvm_options
  }

  # Instructs Spring to listen on port 5000, which is the default port of Elastic Beanstalk
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SERVER_PORT"
    value     = 5000
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_AWS_ACCESS_KEY"
    value     = var.backend_aws_access_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_AWS_COGNITO_POOL_ID"
    value     = var.backend_cognito_pool_id
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_AWS_REGION"
    value     = var.backend_aws_region
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_AWS_S3_BUCKET_NAME"
    value     = var.backend_s3_bucket_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_AWS_SECRET_KEY"
    value     = var.backend_aws_secret_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_MAIL_SES_SOURCE_ARN"
    value     = var.backend_mail_ses_source_arn
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_MONGO_CONNECTION_STRING"
    value     = var.backend_mongo_connection_string
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_OAUTH2_ISSUER_URI"
    value     = var.backend_oauth2_issuer_uri
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_OAUTH2_JWK_URI"
    value     = var.backend_oauth2_jwk_uri
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_SQS_CONVERSION_QUEUE_URL"
    value     = var.backend_sqs_conversion_queue_url
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EBW_SQS_EMAIL_QUEUE_URL"
    value     = var.backend_sqs_email_queue_url
  }


  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.backend_instance_type
  }
}

resource "aws_s3_bucket" "backend_source_code_bucket" {
  bucket = "ebook-wizard-backend-source-code-${terraform.workspace}"
}

resource "aws_s3_object" "backend_source_code" {
  bucket = aws_s3_bucket.backend_source_code_bucket.id
  key    = "ebookwizard-${local.backend_version}.zip"
  source = local.backend_zip_filepath
}

resource "aws_elastic_beanstalk_application_version" "backend_version" {
  name        = local.backend_version
  application = aws_elastic_beanstalk_application.backend_app.name
  bucket      = aws_s3_bucket.backend_source_code_bucket.id
  key         = aws_s3_object.backend_source_code.id
}
