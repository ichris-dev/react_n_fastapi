variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name prefix used to tag resources"
  type        = string
  default     = "ptroject-new"
}

variable "instance_type" {
  description = "Free-tier-eligible instance type (t3.micro/t3.small/t4g.micro/t4g.small on post-July-2025 accounts)"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name to give the AWS key pair"
  type        = string
  default     = "ptroject-new-key"
}

variable "public_key_path" {
  description = "Path to your local SSH public key, e.g. ~/.ssh/id_ed25519.pub. Generate one with: ssh-keygen -t ed25519 -f ~/.ssh/ptroject_new"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "Your IP address in CIDR form, e.g. 203.0.113.5/32 (check whatismyip.com). Never leave this as 0.0.0.0/0."
  type        = string
}
