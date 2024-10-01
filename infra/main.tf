module "frontend" {
    count = terraform.workspace == "local" ? 0 : 1
    depends_on = [module.backend]
    source = "./frontend"
    github_token = var.github_token
}

module "backend" {
    count = terraform.workspace == "local" ? 0 : 1
    depends_on = [module.database, module.file_storage]
    source = "./backend"

    backend_aws_secret_key = var.aws_secret_key
    backend_aws_access_key = var.aws_access_key
    backend_cognito_pool_id = var.cognito_pool_id
    backend_aws_region = var.aws_region
    backend_s3_bucket_name = module.file_storage.s3_bucket_name
    backend_mongo_connection_string = module.database.mongodb_connection_string
    backend_sqs_email_queue_url = module.queue.email_queue_url
    backend_sqs_conversion_queue_url = module.queue.conversion_queue_url
    backend_oauth2_jwk_uri = var.cognito_oauth2_jwk_uri
    backend_oauth2_issuer_uri = var.cognito_oauth2_issuer_uri
    backend_mail_ses_source_arn = var.mail_ses_source_arn
}

module "database" {
    source = "./database"
    atlas_public_key = var.atlas_public_key
    atlas_private_key = var.atlas_private_key
    atlas_organization_id = var.atlas_organization_id
    atlas_db_username = var.atlas_db_username
    atlas_db_password = var.atlas_db_password
}

module "file_storage" {
    source = "./file_storage"
}

module "queue" {
    source = "./queue"
}
