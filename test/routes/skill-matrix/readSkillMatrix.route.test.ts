import {test} from "tap"
import createApp from "@src/app";
import {SkillMatrixMineResponseType} from "@models/skillMatrix.model";

test('read skill matrix without authentication', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix/',
    })

    t.equal(response.statusCode, 401)
})

test('read all skill matrix without params', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix/',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 400)
})

test('read all skill matrix with invalid params', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix?invalid_param=test',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 400)
})

test('read all skill matrix with empty param', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix?company=',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    t.equal(response.statusCode, 400)
})

test('read all skill matrix with company param', async t => {
    const app = createApp({
        logger: false,
    })

    t.teardown(() => {
        app.close();
    })

    await app.ready()

    const token = app.createTestJwt({
        "email": "nicholas.crow@email.com",
        "name": "Nicholas Crow",
        "picture": "https://test.com/nicholas.crow.jpg",
    })

    const response = await app.inject({
        method: 'GET',
        url: '/api/skill-matrix?company=it',
        headers: {
            authorization: `Bearer ${token}`
        }
    })

    const userSkillMatrix = response.json<SkillMatrixMineResponseType>()

    t.equal(response.statusCode, 200)
    t.equal(userSkillMatrix.length, 2)

    const expectedResult = [
        {
            "george.python": {                                              
                "company": "it",                                                     
                "crew": "sun",                                                       
                "skills": {     
                    "PHP": 1,
                    "Frontend (JS/TS)": 0,
                    "NodeJS (JS/TS)": 0,                         
                    "Native Android": 0,                                               
                    "Native iOS": 0,                                                   
                    "Multiplatform Mobile (ionic, react-native, flutter)": 0, 
                    "UI Development (HTML/CSS/SCSS)": 0,                      
                    "C#": 0,                                                 
                    "Python": 3,                                             
                    "Java/Kotlin": 0,                                        
                    "Elixir": 0,                                             
                    "Ruby (Rails)": 0,                                                 
                    "Rust": 0,                                               
                    "Serverless (AWS Lambda, DynamoDB, Step Function...)": 0,          
                    "Servizi core (IAM, EC2,VPC,RDS,S3, Elasticache)": 0,              
                    "Servizi Migration (CloudEndure, SMS)": 0,                         
                    "Servizi Data Migration (DMS, DataSync, Transfer Family)": 0,      
                    "Servizi Serverless (Lambda, APIGW, Step Functions, DynamoDB)": 0, 
                    "Servizi Data Visualization (QuickSight, ...)": 0,                 
                    "Servizi Data Analytics (Glue, Athena, Redshift, EMR)": 0,         
                    "Servizi CI/CD (codepipeline, codebuild, codedeploy)": 0,          
                    "Servizi Security (IAM advanced, KMS, HSM, WAF)": 0,               
                    "Servizi Networking (VPN, Transit Gateway, VPC Advanced)": 0,      
                    "Servizi Container Orchestration (ECS, EKS, Kubernetes)": 0,       
                    "Serverless (Serverless Framework, AWS SAM)": 0,                   
                    "IAC (Terraform, Cloudformation, CDK, Ansible)": 0,                
                    "Monitoring (Cloudwatch, New Relic, Prometheus, Grafana)": 0,      
                    "Machine Learning (Amazon Sagemaker, Rekognition, Lex..)": 0,      
                    "Cloud Governance (Control Tower)": 0,                             
                    "Cloud Finance (Billing e Cost explorer)": 0,                      
                    "Programmazione (Bash, Python)": 0,                                
                    "OS Server (Linux, Windows)": 0,                                   
                    "Servizi Data Streaming (Kinesis, MSK, Kafka)": 0,                 
                    "Servizi IoT": 0,                                                  
                },                                                                   
            },    
        },
        {
            "nicholas.crow@email.com": {                                    
                "company": "it",                                                     
                "crew": "moon",                                                      
                "skills": {  
                    "PHP": 3,     
                    "Frontend (JS/TS)": 0,       
                    "NodeJS (JS/TS)": 0,                                                                         
                    "Native Android": 0,                                               
                    "Native iOS": 0,                                                   
                    "Multiplatform Mobile (ionic, react-native, flutter)": 0, 
                    "UI Development (HTML/CSS/SCSS)": 0,                      
                    "C#": 0,                                                 
                    "Python": 0,                                             
                    "Java/Kotlin": 3,                                        
                    "Elixir": 0,                   
                    "Ruby (Rails)": 0,                                                 
                    "Rust": 0,                                               
                    "Serverless (AWS Lambda, DynamoDB, Step Function...)": 0,          
                    "Servizi core (IAM, EC2,VPC,RDS,S3, Elasticache)": 0,              
                    "Servizi Migration (CloudEndure, SMS)": 0,                         
                    "Servizi Data Migration (DMS, DataSync, Transfer Family)": 0,      
                    "Servizi Serverless (Lambda, APIGW, Step Functions, DynamoDB)": 0, 
                    "Servizi Data Visualization (QuickSight, ...)": 0,                 
                    "Servizi Data Analytics (Glue, Athena, Redshift, EMR)": 0,         
                    "Servizi CI/CD (codepipeline, codebuild, codedeploy)": 0,          
                    "Servizi Security (IAM advanced, KMS, HSM, WAF)": 0,               
                    "Servizi Networking (VPN, Transit Gateway, VPC Advanced)": 0,      
                    "Servizi Container Orchestration (ECS, EKS, Kubernetes)": 0,       
                    "Serverless (Serverless Framework, AWS SAM)": 0,                   
                    "IAC (Terraform, Cloudformation, CDK, Ansible)": 0,                
                    "Monitoring (Cloudwatch, New Relic, Prometheus, Grafana)": 0,      
                    "Machine Learning (Amazon Sagemaker, Rekognition, Lex..)": 0,      
                    "Cloud Governance (Control Tower)": 0,                             
                    "Cloud Finance (Billing e Cost explorer)": 0,                      
                    "Programmazione (Bash, Python)": 0,                                
                    "OS Server (Linux, Windows)": 0,                                   
                    "Servizi Data Streaming (Kinesis, MSK, Kafka)": 0,                 
                    "Servizi IoT": 0,                                                  
                }
            }
        }
    ]
    t.same(userSkillMatrix, expectedResult)
})
