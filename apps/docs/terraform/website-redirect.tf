module "labels-redirect" {
  enabled = local.prod_env
  source  = "cloudposse/label/null"
  version = "v0.25.0"

  context = module.this.context

  name = "redirect-${var.repository_name}"
}

module "cdn_redirect" {
  enabled                     = local.prod_env
  source                      = "cloudposse/cloudfront-s3-cdn/aws"
  version                     = "0.94.0"
  parent_zone_id              = data.aws_route53_zone.default.zone_id
  cors_allowed_origins        = [local.www_website_domain]
  dns_alias_enabled           = true
  aliases                     = [local.www_website_domain]
  acm_certificate_arn         = module.acm_request_certificate_redirect.arn
  website_enabled             = true
  s3_website_password_enabled = true

  allow_ssl_requests_only  = false
  redirect_all_requests_to = "https://${local.website_domain}"

  cloudfront_access_log_create_bucket = false
  cloudfront_access_logging_enabled   = false
  minimum_protocol_version            = "TLSv1.2_2021"
  versioning_enabled                  = false
  context                             = module.labels-redirect.context
  origin_force_destroy                = false
  default_root_object                 = ""

  depends_on = [module.acm_request_certificate_redirect]
}


# create acm and explicitly set it to us-east-1 provider
module "acm_request_certificate_redirect" {
  enabled = local.prod_env
  source  = "cloudposse/acm-request-certificate/aws"
  providers = {
    aws = aws.us-east-1
  }

  zone_name = local.parent_zone_name

  version                           = "0.18.0"
  domain_name                       = local.www_website_domain
  subject_alternative_names         = []
  process_domain_validation_options = true
  ttl                               = "300"
  context                           = module.labels-redirect.context
}
