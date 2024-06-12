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
