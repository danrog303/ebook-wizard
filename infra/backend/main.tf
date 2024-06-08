resource "aws_elastic_beanstalk_application" "backend_app" {
  name        = "ebook-wizard-${terraform.workspace}"
}

resource "aws_elastic_beanstalk_environment" "backend_environment" {
  name                = "ebook-wizard-${terraform.workspace}-env"
  application         = aws_elastic_beanstalk_application.backend_app.name
  solution_stack_name = var.backend_solution_stack_name
  version_label = aws_elastic_beanstalk_application_version.backend_version.name

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
  key    = "ebookwizard-${local.backend_version}.jar"
  source = local.backend_jar_filepath
}

resource "aws_elastic_beanstalk_application_version" "backend_version" {
  name        = local.backend_version
  application = aws_elastic_beanstalk_application.backend_app.name
  bucket      = aws_s3_bucket.backend_source_code_bucket.id
  key         = aws_s3_object.backend_source_code.id
}
