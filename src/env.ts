import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'

const buildStage = process.env.npm_config_buildstage

let secret_name = ''
if (buildStage == 'stage') {
  secret_name = 'noprod-brickly-db-host-rds'
}
if (buildStage == 'prod') {
  secret_name = 'prod-brickly-db-host-rds'
}

const client = new SecretsManagerClient({
  region: 'eu-south-1',
})

async function getDbSecret(): Promise<string> {
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
    }),
  )

  return response.SecretString ?? ''
}

getDbSecret().then((secretString) => {
  const secret = JSON.parse(secretString)
  console.log(
    `DATABASE_URL=mysql://${secret.username}:${encodeURIComponent(secret.password)}@${secret.host}:${secret.port}/${secret.dbname}`,
  )
})
