variable "aws_region" {
    description = "AWS: Region to deploy resources"
    type        = string
    default     = "eu-central-1"
}

variable "aws_access_key" {
	  description = "AWS: Access key"
	  type        = string
	  sensitive   = true
}

variable "aws_secret_key" {
      description = "AWS: Secret key"
      type        = string
      sensitive   = true
}

variable "github_token" {
    description = "GitHub: Oauth2 token required to access the repository"
    type        = string
    sensitive   = true
}

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

variable cognito_pool_id {
    description = "AWS Cognito: Pool ID"
    type        = string
    sensitive   = true
}

variable cognito_oauth2_jwk_uri {
    description = "AWS Cognito: OAuth2 JWK URI"
    type        = string
    sensitive   = true
}

variable cognito_oauth2_issuer_uri {
    description = "AWS Cognito: OAuth2 Issuer URI"
    type        = string
    sensitive   = true
}

variable mail_ses_source_arn {
    description = "AWS SES: Source ARN"
    type        = string
    sensitive   = true
}
