locals {
    backend_jar_filepath = tolist(fileset("${path.module}/../../backend/target", "ebookwizard-*.jar"))[0]
    backend_zip_filepath = "${path.module}/../../backend/target/ebookwizard.zip"
}

locals {
    backend_version = regex("[0-9]+\\.[0-9]+\\.[0-9]+", basename(local.backend_jar_filepath))
}
