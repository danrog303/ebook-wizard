resource "aws_amplify_app" "frontend_amplify" {
  name        = "ebook-wizard-${terraform.workspace}"
  repository  = var.github_repo
  oauth_token = var.github_token
  build_spec = file("${path.module}/amplify.yml")
  enable_branch_auto_build = true
}

resource "aws_amplify_branch" "frontend_amplify_branch" {
  app_id  = aws_amplify_app.frontend_amplify.id
  branch_name = var.github_branch
  stage = "PRODUCTION"
  enable_auto_build = true
}

resource "aws_amplify_webhook" "frontend_amplify_webhook" {
  app_id      = aws_amplify_app.frontend_amplify.id
  branch_name = aws_amplify_branch.frontend_amplify_branch.branch_name
}

data "http" "frontend_amplify_webhook_call" {
  url    = "${aws_amplify_webhook.frontend_amplify_webhook.url}&operation=startbuild"
  method = "POST"

  request_headers = {
    "Content-Type" = "application/json"
  }
}
