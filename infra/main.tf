module "frontend" {
    source = "./frontend"
    github_token = var.github_token
}

module "database" {
    source = "./database"
    atlas_public_key = var.atlas_public_key
    atlas_private_key = var.atlas_private_key
    atlas_organization_id = var.atlas_organization_id
    atlas_db_username = var.atlas_db_username
    atlas_db_password = var.atlas_db_password
}
