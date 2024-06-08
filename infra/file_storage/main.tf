resource "aws_s3_bucket" "s3_bucket" {
  bucket = "ebook-wizard-filestorage-${terraform.workspace}"
}

resource "aws_s3_bucket_ownership_controls" "s3_bucket_ownership" {
  bucket = aws_s3_bucket.s3_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "s3_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.s3_bucket_ownership]

  bucket = aws_s3_bucket.s3_bucket.id
  acl    = "private"
}
