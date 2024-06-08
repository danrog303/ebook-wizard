output "frontend_url" {
    description = "Frontend: URL to access the application"
    value = module.frontend.amplify_app_url
}

output "database_connection_string" {
    description = "MongoDB: Connection string to access the database"
    value = module.database.mongodb_connection_string
}

output "database_db_name" {
    description = "MongoDB: Database name"
    value = module.database.mongodb_db_name
}
