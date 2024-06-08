variable backend_instance_type {
    description = "Elastic Beanstalk: EC2 instance type for backend environment"
    type = string
    default = "t2.micro"
}

variable backend_solution_stack_name {
    description = "Elastic Beanstalk: Solution stack name for backend environment"
    type = string
    default = "64bit Amazon Linux 2023 v4.2.4 running Corretto 21"
}

variable backend_jvm_options {
    description = "Elastic Beanstalk: JVM options for backend environment"
    type = string
    default = "-Xmx512m -Xms256m"
}
