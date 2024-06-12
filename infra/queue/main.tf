resource "aws_sqs_queue" "sqs_queue" {
  name                      = "ebook_wizard_queue_${terraform.workspace}.fifo"
  delay_seconds             = 0
  fifo_queue                = true
  max_message_size          = 262144
  message_retention_seconds = 345600
  receive_wait_time_seconds = 3
  visibility_timeout_seconds = 43200
}
