module "this" {
  source  = "cloudposse/label/null"
  version = "v0.25.0"

  namespace   = var.repository_name
  environment = var.environment
  name        = var.project_name

  tags = {
    "Repository" = var.repository_name
    "Project"    = var.project_name
  }
}
