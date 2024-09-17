###### Must Have: 
- AWS CLI: `brew install awscli`
- Creare file `~/.aws/config` in locale, inserire:
```
[profile claranet-brickly]
sso_session = sso-claranet
sso_account_id = 755827290206
sso_role_name = AWSAdministratorAccess
region = eu-south-1
output = json

[sso-session sso-claranet]
sso_start_url = https://it-claranet.awsapps.com/start/
sso_region = eu-south-1
sso_registration_scopes = sso:account:access
```
##### NoProd
1) Creare file `~/.ssh/noprod-brickly-EC2JumpBoxInstance-Key.pem` in locale, inserire il contenuto del Parameter Store `/ec2/keypair/key-0b62d3e05524770fa`
2) `chmod 600 ~/.ssh/noprod-brickly-EC2JumpBoxInstance-Key.pem`

**(Terminale 1)**
`aws sso login --profile claranet-brickly`

`aws ssm start-session  --target i-0ed31879c44f649a6 --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["22"], "localPortNumber":["9999"]}' --profile claranet-brickly`
**(Terminale 2)**
`ssh ec2-user@localhost -p 9999 -N -L 3388:noprod-brickly-rds.cgizfdoi2pby.eu-south-1.rds.amazonaws.com:3306 -i ~/.ssh/noprod-brickly-EC2JumpBoxInstance-Key.pem`
#### **Prima di switchare connessione da NoProd a Prod e viceversa, lanciare in locale `rm -rf ~/.ssh/known_hosts*`**
*comando overkill per lo scopo, ma risolve il problema, basterebbe eliminare solo l'entry della chiave .pem. Altrimenti viene rilevata una change di chiave per hostname.

##### Prod
1) Creare file `~/.ssh/prod-brickly-EC2JumpBoxInstance-Key.pem` in locale, inserire il contenuto del Parameter Store `/ec2/keypair/key-03172e8ad69fe1e7b`
2) `chmod 600 ~/.ssh/prod-brickly-EC2JumpBoxInstance-Key.pem`

**(Terminale 1)**
`aws sso login --profile claranet-brickly`

`aws ssm start-session  --target i-0a9217ec82b1c7dce --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["22"], "localPortNumber":["9999"]}' --profile claranet-brickly`
**(Terminale 2)**
`ssh ec2-user@localhost -p 9999 -N -L 3388:prod-brickly-rds.cgizfdoi2pby.eu-south-1.rds.amazonaws.com:3306 -i ~/.ssh/prod-brickly-EC2JumpBoxInstance-Key.pem`
###### DBeaver (MariaDB Connection):

`Connected by: Host`
`Server Host: localhost`
`Porta: 3388`
*estrapolare username e password dai Secrets Manager:
- `noprod-brickly-db-admin-credentials-rds`
- `prod-brickly-db-admin-credentials-rds`