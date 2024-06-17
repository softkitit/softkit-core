# website variables
locals {
  # Editable Variables

  parent_zone_env = tomap({
    "prod" : local.base_domain
  })

  # Non-Editable Variables
  prod_env           = var.environment == "prod"
  base_domain        = "softkit.dev"
  notFoundPagePath   = "/404.html"
  parent_zone_name   = lookup(local.parent_zone_env, var.environment, "${var.environment}.${local.base_domain}")
  website_domain     = "docs.${local.parent_zone_name}"
  www_website_domain = "www.${local.website_domain}"


}
