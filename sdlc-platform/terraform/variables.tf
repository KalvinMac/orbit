variable "aws_region" {
  description = "The AWS region to deploy to"
  default     = "us-west-2"
}

variable "app_name" {
  description = "Name of the application"
  default     = "sdlc-platform"
}

variable "environment" {
  description = "Environment name"
  default     = "production"
}

variable "db_password" {
  description = "Password for the RDS database"
  sensitive   = true
}

variable "db_username" {
  description = "Username for the RDS database"
  default     = "postgres"
}
