output "mongodb_connection_string" {
    description = "MongoDB: Connection string"
    value = mongodbatlas_cluster.mongodb_cluster.connection_strings[0].standard_srv
}

output "mongodb_db_name" {
    description = "MongoDB: Database name"
    value = var.atlas_db_name
}
