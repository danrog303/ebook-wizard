variable "atlas_public_key" {
    description = "MongoDB Atlas: Public key"
    type        = string
    sensitive   = true
}

variable "atlas_private_key" {
    description = "MongoDB Atlas: Private key"
    type        = string
    sensitive   = true
}

variable "atlas_organization_id" {
    description = "MongoDB Atlas: Organization ID"
    type        = string
    sensitive   = false
}

variable "atlas_region" {
    description = "MongoDB Atlas: Region to deploy resources"
    type        = string
    default     = "EU_WEST_1"
    sensitive = false
}

variable "atlas_db_username" {
    description = "MongoDB Atlas: Database username"
    type        = string
    sensitive   = true
}

variable "atlas_db_password" {
    description = "MongoDB Atlas: Database password"
    type        = string
    sensitive   = true
}

variable "atlas_db_name" {
    description = "MongoDB Atlas: Database name"
    type        = string
    default     = "ebookwizard"
    sensitive = false
}
