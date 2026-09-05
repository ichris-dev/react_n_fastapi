output "public_ip" {
  description = "Elastic IP of the app server - use this in the Ansible inventory"
  value       = aws_eip.app.public_ip
}

output "ssh_command" {
  description = "Quick command to SSH in and sanity-check the box"
  value       = "ssh -i <path-to-your-private-key> ubuntu@${aws_eip.app.public_ip}"
}
