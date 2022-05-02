## CDK Infra - Customer

![CDK Deployment Status](https://github.com/inqdocloud/aws-cdk-skeleton-infra/actions/workflows/cdk_deploy.yml/badge.svg) 
![CDK Test Status](https://github.com/inqdocloud/aws-cdk-skeleton-infra/actions/workflows/cdk_test.yml/badge.svg) 

This is the CDK infrastructure repository for the XXXXX project. It deploys XXXXX 

## Design

Design for the deployed infrastructure

![Infra Design](./diagram.png?raw=true "Design")


<!-- GETTING STARTED -->

## Project Deployment
This code can be deployed using the included Github Action using a secure OIDC connection to designated deployment roles in the AWS environment. 

### Prerequisites

The Github Action deployment includes all prerequisites. However, should you want to deploy or test using other methods, feel free to do so. 
You'll need.. 
* Node.js 14+
* Typescript 2.7+
* AWS CDK v2
* CDK Bootstrapped AWS account(s)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/inqdocloud/Project-Name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Set AWS access keys for designated account
4. Synthesize CloudFormation
   ```sh
   cdk synth
   ```
5. List CloudFormation Stacks
   ```sh
   cdk ls 
   ```
6. Diff or Deploy environment
   ```sh
   cdk diff <STACK> | "*" 
   cdk deploy -v <STACK> | "*"
   
> :warning: Preferred method of deployment is using the included Github Actions.  

<!-- ROADMAP -->
## Roadmap

- [x] Add Changelog
- [ ] Add Additional Templates w/ Examples
- [ ] Add "components" document to easily copy & paste sections of the readme


<!-- CONTRIBUTING -->
## Contributing

You can propose to include your CDK examples / code by opening a pull request to the aws-cdk-skeleton-infra repository or by opening a new issue.  


<!-- CONTACT -->
## Contact

inQdo Cloud BV  
support@inqdo.cloud
