terraform {
  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = ">=1.4.0"
    }
  }
}

provider "aws" {
    region = var.aws_region
    access_key = var.aws_access_key
	secret_key = var.aws_secret_key
}

provider "mongodbatlas" {
    public_key = var.atlas_public_key
    private_key = var.atlas_private_key
}
