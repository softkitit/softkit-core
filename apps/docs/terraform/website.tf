data "aws_cloudfront_cache_policy" "caching-managed-policy" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_response_headers_policy" "website-security-policy" {
  name    = "${var.environment}-${var.repository_name}-caching-and-security-policy"
  comment = "policy to handle caching and security headers"

  cors_config {
    access_control_allow_credentials = false

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET", "OPTIONS"]
    }

    access_control_allow_origins {
      items = [local.website_domain]
    }

    origin_override = true
  }

  custom_headers_config {
    items {
      header   = "Cache-Control"
      override = true
      value    = "public, max-age=15552000"
    }
  }

  security_headers_config {
    referrer_policy {
      override        = true
      referrer_policy = "strict-origin-when-cross-origin"
    }
    xss_protection {
      override   = true
      protection = true
      mode_block = true
    }
    frame_options {
      override     = true
      frame_option = "DENY"
    }
    content_type_options {
      override = true
    }
    strict_transport_security {
      access_control_max_age_sec = 31536000
      override                   = true
    }
  }
}


module "cdn" {
  source                      = "cloudposse/cloudfront-s3-cdn/aws"
  version                     = "0.94.0"
  parent_zone_id              = data.aws_route53_zone.default.zone_id
  cors_allowed_origins        = [local.website_domain]
  dns_alias_enabled           = true
  aliases                     = [local.website_domain]
  acm_certificate_arn         = module.acm_request_certificate.arn
  website_enabled             = true
  s3_website_password_enabled = true
  allow_ssl_requests_only     = false
  custom_error_response = [
    {
      error_code            = 404
      response_code         = 404
      response_page_path    = local.notFoundPagePath
      error_caching_min_ttl = 300
    }
  ]

  cache_policy_id            = data.aws_cloudfront_cache_policy.caching-managed-policy.id
  response_headers_policy_id = aws_cloudfront_response_headers_policy.website-security-policy.id

  cloudfront_access_log_create_bucket = false
  cloudfront_access_logging_enabled   = false
  minimum_protocol_version            = "TLSv1.2_2021"
  versioning_enabled                  = false
  context                             = module.this.context
  origin_force_destroy                = false
}


# create acm and explicitly set it to us-east-1 provider
module "acm_request_certificate" {
  source = "cloudposse/acm-request-certificate/aws"
  providers = {
    aws = aws.us-east-1
  }

  zone_name = local.parent_zone_name

  version                           = "0.18.0"
  domain_name                       = local.website_domain
  subject_alternative_names         = []
  process_domain_validation_options = true
  ttl                               = 300
  context                           = module.this.context
}
