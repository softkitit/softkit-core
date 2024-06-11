# When using partial configuration, Terraform requires at a minimum that an
# empty backend configuration is specified in one of the root Terraform configuration
# files, to specify the backend type. For example:

terraform {
  required_version = ">= 1.0.0"

  backend "s3" {

  }
}
