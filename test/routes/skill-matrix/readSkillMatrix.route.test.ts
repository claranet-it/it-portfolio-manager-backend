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
            "nicholas.crow@email.com": {                                    
                "company": "it",                                                     
                "crew": "moon",                                                      
                "skills": {                                                   
                    "PHP - Backend": 3,                                                
                    "JavaScript/TypeScript - Frontend": 0,                             
                    "JavaScript/TypeScript - Backend": 0,                              
                    "Native Android": 0,                                               
                    "Native iOS": 0,                                                   
                    "Multiplatform Mobile (ionic, react-native, flutter, etc etc)": 0, 
                    "UI Development (HTML/CSS/SCSS, etc etc)": 0,                      
                    "C# - Backend": 0,                                                 
                    "Python - Backend": 0,                                             
                    "Java/Kotlin - Backend": 3,                                        
                    "Elixir - Backend": 0,                                             
                    "Ruby (Rails)": 0,                                                 
                    "Rust - Backend": 0,                                               
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
        },
        {
            "george.python": {                                              
                "company": "it",                                                     
                "crew": "sun",                                                       
                "skills": {                                                   
                    "PHP - Backend": 1,                                                
                    "JavaScript/TypeScript - Frontend": 0,                             
                    "JavaScript/TypeScript - Backend": 0,                              
                    "Native Android": 0,                                               
                    "Native iOS": 0,                                                   
                    "Multiplatform Mobile (ionic, react-native, flutter, etc etc)": 0, 
                    "UI Development (HTML/CSS/SCSS, etc etc)": 0,                      
                    "C# - Backend": 0,                                                 
                    "Python - Backend": 3,                                             
                    "Java/Kotlin - Backend": 0,                                        
                    "Elixir - Backend": 0,                                             
                    "Ruby (Rails)": 0,                                                 
                    "Rust - Backend": 0,                                               
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
        }
    ]
    t.same(userSkillMatrix, expectedResult)
})
