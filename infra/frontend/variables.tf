variable "github_repo" {
    description = "GitHub repository which contains the frontend code"
    type        = string
    default     = "https://github.com/danrog303/ebook-wizard"
}

variable "github_token" {
    description = "GitHub Oauth2 token required to access the repository"
    type        = string
    sensitive   = true
}

variable "github_branch" {
    description = "GitHub branch to deploy"
    type        = string
    default     = "main"
}
