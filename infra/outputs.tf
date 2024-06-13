output "frontend_url" {
    description = "Frontend: URL to access the application"
    value = length(module.frontend) > 0 ? module.frontend[0].amplify_app_url : "not deployed"
}

output "database_connection_string" {
    description = "MongoDB: Connection string to access the database"
    value = module.database.mongodb_connection_string
}

output "database_db_name" {
    description = "MongoDB: Database name"
    value = module.database.mongodb_db_name
}

output "file_storage_s3_bucket_name" {
    description = "File storage: S3 bucket name"
    value = module.file_storage.s3_bucket_name
}

output "backend_url" {
    description = "Backend: URL to access the application"
    value = length(module.backend) > 0 ? module.backend[0].backend_url : "not deployed"
}

output "conversion_queue_url" {
    description = "Queue: URL to access the AWS SQS conversion queue"
    value = module.queue.conversion_queue_url
}

output "email_queue_url" {
    description = "Queue: URL to access the AWS SQS email queue"
    value = module.queue.email_queue_url
}
