# You cannot create a new backend by simply defining this and then
# immediately proceeding to "terraform apply". The S3 backend must
# be bootstrapped according to the simple yet essential procedure in
# https://github.com/cloudposse/terraform-aws-tfstate-backend#usage

module "terraform_state_backend" {
  source  = "cloudposse/tfstate-backend/aws"
  version = "v1.4.0"
  context = module.this.context

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  dynamodb_table_name                = var.dynamo_db_table_name
  s3_bucket_name                     = var.s3_bucket_name
  terraform_state_file               = var.tf_state_file_name
  terraform_backend_config_file_path = ""
  terraform_backend_config_file_name = ""
  force_destroy                      = var.force_destroy
}

