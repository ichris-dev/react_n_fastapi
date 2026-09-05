# Deploying ptroject_new to a free-tier EC2 box

## Where every file goes

Your project lives at `C:\Users\timot\desktop\projects\react_projects` on
Windows, which WSL sees at `/mnt/c/Users/timot/desktop/projects/react_projects`.
Create an `infra` folder there and put these files in exactly this layout:

```
react_projects/
├── learn_react/              (already exists)
├── project_backend/          (already exists)
├── docker-compose.yml        (already exists)
├── docker-compose.test.yml   (already exists)
├── Jenkinsfile                (already exists)
└── infra/                     <-- create this folder
    ├── README.md                          (this file)
    ├── terraform/
    │   ├── main.tf
    │   ├── variables.tf
    │   ├── outputs.tf
    │   └── terraform.tfvars.example
    └── ansible/
        ├── playbook.yml
        ├── inventory.ini.example
        ├── group_vars/
        │   └── app.yml
        └── templates/
            ├── docker-compose.prod.yml
            └── .env.j2
```

Every file below was downloaded from the chat as an individual file - move
each one from your Downloads folder into the matching spot above using
Windows Explorer. WSL reads/writes the same files instantly since it's the
same physical drive, just mounted differently.

## What's already done (from earlier in this conversation)

- WSL Ubuntu 26.04 installed and set as default
- Terraform 1.9.8 installed at `/usr/local/bin/terraform`
- Ansible (core 2.20.1) and the AWS CLI installed via apt
- SSH key pair generated at `~/.ssh/ptroject_new` / `~/.ssh/ptroject_new.pub`
  (that's `/home/developer/.ssh/ptroject_new` in full)
- `aws configure` already run with your AWS credentials

## 1. Before you touch Terraform

- Set a billing alarm: AWS Console > Billing > Budgets > create a budget
  alerting at, say, $5.
- Make your Docker Hub repos **public** (Docker Hub > repo > Settings >
  Visibility). This lets the EC2 box `docker compose pull` without needing
  any Docker Hub login on the server at all.

## 2. Configure and run Terraform

All commands below run inside WSL (open it with `wsl` in PowerShell, or
just keep using the Ubuntu window you already have open).

```
cd /mnt/c/Users/timot/desktop/projects/react_projects/infra/terraform
cp terraform.tfvars.example terraform.tfvars
curl ifconfig.me   # note the IP this prints
nano terraform.tfvars
```

In `terraform.tfvars`, set:

```
public_key_path  = "/home/developer/.ssh/ptroject_new.pub"
allowed_ssh_cidr = "<the-ip-from-curl-ifconfig.me>/32"
```

Save with `Ctrl+O`, Enter, then `Ctrl+X`. Then:

```
terraform init
terraform plan
```

Read through the plan output - it should show it creating a security
group, a key pair, an EC2 instance, and an Elastic IP, nothing else. Then:

```
terraform apply
```

Type `yes` when prompted. When it finishes, copy the `public_ip` value
from the output - you need it next.

## 3. Configure Ansible

```
cd ../ansible
cp inventory.ini.example inventory.ini
nano inventory.ini
```

Replace `REPLACE_WITH_TERRAFORM_OUTPUT_IP` with the `public_ip` from step 2,
and change the key path to:

```
ansible_ssh_private_key_file=/home/developer/.ssh/ptroject_new
```

Save and exit. Now store the real Postgres password (don't reuse the
"postgres" default from `.env.example` - that's dev-only):

```
mkdir -p group_vars/app
ansible-vault create group_vars/app/vault.yml
```

This opens an editor - type:

```yaml
postgres_password: <choose-a-strong-password-here>
```

Save and exit. You'll be asked to set a vault password first - remember it,
you'll need it on every deploy.

## 4. Deploy

```
ansible-playbook -i inventory.ini playbook.yml --ask-vault-pass
```

Enter your vault password when prompted. This installs Docker on the EC2
box, copies the compose file and `.env`, pulls the `:latest` images your
Jenkins pipeline already pushes, and starts the stack.

Check it worked:

```
curl http://<public_ip>:8000/docs
curl http://<public_ip>:3000
```

Re-running this same `ansible-playbook` command after any new Jenkins push
is your redeploy command - it re-pulls and recreates the containers.

## 5. Wiring this into Jenkins (later, once step 4 works)

Your Jenkins agent runs Windows `bat` steps, and Ansible needs Linux to run
from. Once the manual deploy above is confirmed working, come back and
we'll add a `Deploy` stage to the Jenkinsfile that runs Ansible from a
Docker container (since Docker's already proven to work on that agent) -
no need to touch WSL from Jenkins itself.

## 6. Tearing it down

Don't just stop the EC2 instance - the attached Elastic IP keeps costing
money once it's not attached to something running:

```
cd ../terraform
terraform destroy
```
