data "aws_route53_zone" "default" {
  name         = local.parent_zone_name
  private_zone = false
}



