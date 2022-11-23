# plantk

## API Access

[RapidApi - House Plants](https://rapidapi.com/mnai01/api/house-plants2)

## Start

After first deploy you must go into ur AWS Secret Manager client and add the Rapid API Secret Key as the value

GO TO Secret manager -> Select Retrieve secret value -> Select edit on key -> insert RapidAPISecretKey as value

Then copy the SecretID name and place it in the getSecret file

install

`sam cli`

`aws cli`

Run

`aws configure`

## System Design

![SysDesign](./System_Design.png)

## Summary

This project contains source code and supporting files for a serverless application that you can deploy with the AWS Serverless Application Model (AWS SAM) command line interface (CLI). It includes the following files and folders:

- `src` - Code for the application's Lambda function.
- `events` - Invocation events that you can use to invoke the function.
- `__tests__` - Unit tests for the application code.
- `template.json` - A template that defines the application's AWS resources.

The application uses several AWS resources, including Lambda functions, an API Gateway API, and Amazon DynamoDB tables. These resources are defined in the `template.json` file in this project. You can update the template to add AWS resources through the same deployment process that updates your application code.

If you prefer to use an integrated development environment (IDE) to build and test your application, you can use the AWS Toolkit.  
The AWS Toolkit is an open-source plugin for popular IDEs that uses the AWS SAM CLI to build and deploy serverless applications on AWS. The AWS Toolkit also adds step-through debugging for Lambda function code.

To get started, see the following:

- [CLion](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [GoLand](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [IntelliJ](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [WebStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [Rider](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [PhpStorm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [PyCharm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [RubyMine](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [DataGrip](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
- [VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
- [Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/welcome.html)

## Deploy the sample application

The AWS SAM CLI is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the AWS SAM CLI, you need the following tools:

- AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
- Node.js - [Install Node.js 14](https://nodejs.org/en/), including the npm package management tool.
- Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community).

To build and deploy your application for the first time, run the following in your shell:

```bash
sam build
sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

- **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to your account and region, and a good starting point would be something matching your project name.
- **AWS Region**: The AWS region you want to deploy your app to.
- **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
- **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modifies IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
- **Save arguments to samconfig.toml**: If set to yes, your choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to your application.

The API Gateway endpoint API will be displayed in the outputs when the deployment is complete.

## Use the AWS SAM CLI to build and test locally

Build your application by using the `sam build` command.

```bash
my-application$ sam build
```

The AWS SAM CLI installs dependencies that are defined in `package.json`, creates a deployment package, and saves it in the `.aws-sam/build` folder.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
my-application$ sam local invoke putItemFunction --event events/event-post-item.json
my-application$ sam local invoke getAllItemsFunction --event events/event-get-all-items.json
```

The AWS SAM CLI can also emulate your application's API. Use the `sam local start-api` command to run the API locally on port 3000.

```bash
my-application$ sam local start-api
my-application$ curl http://localhost:3000/
```

The AWS SAM CLI reads the application template to determine the API's routes and the functions that they invoke. The `Events` property on each function's definition includes the route and method for each path.

```yaml
Events:
  Api:
    Type: Api
    Properties:
      Path: /
      Method: GET
```

## Add a resource to your application

The application template uses AWS SAM to define application resources. AWS SAM is an extension of AWS CloudFormation with a simpler syntax for configuring common serverless application resources, such as functions, triggers, and APIs. For resources that aren't included in the [AWS SAM specification](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md), you can use the standard [AWS CloudFormation resource types](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html).

Update `template.json` to add a dead-letter queue to your application. In the **Resources** section, add a resource named **MyQueue** with the type **AWS::SQS::Queue**. Then add a property to the **AWS::Serverless::Function** resource named **DeadLetterQueue** that targets the queue's Amazon Resource Name (ARN), and a policy that grants the function permission to access the queue.

```
Resources:
  MyQueue:
    Type: AWS::SQS::Queue
  getAllItemsFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/get-all-items.getAllItemsHandler
      Runtime: nodejs14.x
      DeadLetterQueue:
        Type: SQS
        TargetArn: !GetAtt MyQueue.Arn
      Policies:
        - SQSSendMessagePolicy:
            QueueName: !GetAtt MyQueue.QueueName
```

The dead-letter queue is a location for Lambda to send events that could not be processed. It's only used if you invoke your function asynchronously, but it's useful here to show how you can modify your application's resources and function configuration.

Deploy the updated application.

```bash
my-application$ sam deploy
```

Open the [**Applications**](https://console.aws.amazon.com/lambda/home#/applications) page of the Lambda console, and choose your application. When the deployment completes, view the application resources on the **Overview** tab to see the new resource. Then, choose the function to see the updated configuration that specifies the dead-letter queue.

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, the AWS SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs that are generated by your Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

**NOTE:** This command works for all Lambda functions, not just the ones you deploy using AWS SAM.

```bash
my-application$ sam logs -n putItemFunction --stack-name sam-app --tail
```

**NOTE:** This uses the logical name of the function within the stack. This is the correct name to use when searching logs inside an AWS Lambda function within a CloudFormation stack, even if the deployed function name varies due to CloudFormation's unique resource name generation.

You can find more information and examples about filtering Lambda function logs in the [AWS SAM CLI documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `__tests__` folder in this project. Use `npm` to install the [Jest test framework](https://jestjs.io/) and run unit tests.

```bash
my-application$ npm install
my-application$ npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following, in this case name might actually be sam-pipeline-dev and sam-pipeline-prod:

```bash
aws cloudformation delete-stack --stack-name plantk
```

## Resources

For an introduction to the AWS SAM specification, the AWS SAM CLI, and serverless application concepts, see the [AWS SAM Developer Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html).

Next, you can use the AWS Serverless Application Repository to deploy ready-to-use apps that go beyond Hello World samples and learn how authors developed their applications. For more information, see the [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/) and the [AWS Serverless Application Repository Developer Guide](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html).

## Help

HOW TO RUN

Run docker `docker-compose up`

Starts API gateway `sam local start-api --docker-network abp-sam-backend -n ./env.json --log-file logfile.txt`

How to write data to local DB

**Just a stock table that contains the PK**

aws dynamodb create-table --cli-input-json file://sample-structure.json --endpoint-url http://localhost:8000

**This will add new attributes to the table**

aws dynamodb batch-write-item --request-items file://sample.json --endpoint-url http://localhost:8000

**List tables**
_remove http://localhost:8000 to check remote tables_

aws dynamodb list-tables --endpoint-url http://localhost:8000

sam local invoke getAllItemsFunction --profile default -e ./events/event-get-all-items.json --docker-network abp-sam-backend

## Docker

Make sure to set network for docker

`docker-compose up`

```
version: '3.8'
services:
    dynamodb-local:
        command: '-jar DynamoDBLocal.jar -sharedDb -dbPath ./data'
        image: 'amazon/dynamodb-local:latest'
        networks:
            - backend
        container_name: dynamodb-local
        ports:
            - '8000:8000'
        volumes:
            - './docker/dynamodb:/home/dynamodblocal/data'
        working_dir: /home/dynamodblocal
networks:
    backend:
        name: abp-sam-backend
```

## DocumentClient

The DynamoDB Document Client is the easiest and most preferred way to interact with a DynamoDB database from a Nodejs or JavaScript application. The document client simplifies working with items in Amazon DynamoDB by abstracting away the notion of attribute values. This abstraction annotates native JavaScript types supplied as input parameters, as well as converts annotated response data to native JavaScript types.

TDLR; from my understanding it makes it easier to deal with DynamoDB by removing its weird needed types in a JSON item
