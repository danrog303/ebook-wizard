output "amplify_app_url" {
    description = "AWS Amplify: URL of the deployed frontend"
    value = "https://main.${aws_amplify_app.frontend_amplify.default_domain}"
}
