resource "aws_sqs_queue" "conversion_queue" {
  name                      = "ebook_wizard_conversion_queue_${terraform.workspace}.fifo"
  delay_seconds             = 0
  fifo_queue                = true
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 3
  visibility_timeout_seconds = 43200
}

resource "aws_sqs_queue" "email_queue" {
  name                      = "ebook_wizard_email_queue_${terraform.workspace}.fifo"
  delay_seconds             = 0
  fifo_queue                = true
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 3
  visibility_timeout_seconds = 43200
}
