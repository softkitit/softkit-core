variable "aws_region" {
  type        = string
  description = "AWS Region where to perform a setup"
}

variable "environment" {
  type        = string
  description = "Environment name (global, prod, dev, etc...). Global means that it belongs to all envs"
}

variable "org_name" {
  type        = string
  description = "Github organisation name for OIDC configuration"
}

variable "repository_name" {
  type        = string
  description = "The repository name for this actions"
  default     = "org-setup"
}

variable "project_name" {
  type        = string
  description = "The project name for monorepo setup"
  default     = "default-project"
}

variable "tf_state_file_name" {
  type        = string
  description = "Terraform file state name on a remote"
  default     = "terraform.tfstate"
}

variable "dynamo_db_table_name" {
  type        = string
  description = "DynamoDB table to manage a tf lock"
}

variable "s3_bucket_name" {
  type        = string
  description = "S3 bucket name to manage"
}

variable "force_destroy" {
  type        = bool
  description = "Force destroy state"
  default     = false
}

