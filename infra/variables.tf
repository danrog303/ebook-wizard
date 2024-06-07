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
