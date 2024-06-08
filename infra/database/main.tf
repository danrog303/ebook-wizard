terraform {
  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = ">=1.4.0"
    }
  }
}

resource "mongodbatlas_project" "mongodb_project" {
  name   = "ebook-wizard-mongo"
  org_id = var.atlas_organization_id
}

resource "mongodbatlas_cluster" "mongodb_cluster" {
  project_id   = mongodbatlas_project.mongodb_project.id
  name         = "ebook-wizard-db-${terraform.workspace}"
  cluster_type = "REPLICASET"

  provider_name = "TENANT"
  backing_provider_name = "AWS"
  provider_instance_size_name = "M0"
  provider_region_name = var.atlas_region
}

resource "mongodbatlas_database_user" "mongodb_user" {
  project_id   = mongodbatlas_project.mongodb_project.id
  username     = var.atlas_db_username
  password     = var.atlas_db_password
  auth_database_name = "admin"
  roles {
    role_name     = "readWrite"
    database_name = "admin"
  }

  roles {
    role_name     = "readWrite"
    database_name = var.atlas_db_name
  }
}

resource "mongodbatlas_project_ip_access_list" "mongodb_ip_access" {
  project_id = mongodbatlas_project.mongodb_project.id
  cidr_block = "0.0.0.0/0"
  comment    = "Allow all IP addresses to connect to the cluster"
}
