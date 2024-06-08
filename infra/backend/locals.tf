locals {
    backend_jar_filename = tolist(fileset("${path.module}/../../backend/target", "ebookwizard-*.jar"))[1]
    backend_jar_filepath = "${path.module}/../../backend/target/${local.backend_jar_filename}"
}

locals {
    backend_version = regex("ebookwizard-([\\d\\.]+).jar", local.backend_jar_filename)[0]
}
