output conversion_queue_url {
    value = aws_sqs_queue.conversion_queue.id
}

output email_queue_url {
    value = aws_sqs_queue.email_queue.id
}
