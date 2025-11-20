# Framework Services

This service contains the foundational infrastructure stacks for the entire application.

## Overview

The framework provides four stacks:

### 1. CertificateStack (us-east-1 only)
Creates ACM wildcard certificates for CloudFront distributions.

**Resources:**
- ACM wildcard certificate for `*.yourdomain.com`
- DNS validation records in Route53

**Requirements:**
- Must be deployed in `us-east-1` region (CloudFront requirement)
- Requires Route53 hosted zone

### 2. NetworkingStack
Manages networking infrastructure including DNS and API Gateway.

**Resources:**
- Route53 DNS records
- API Gateway custom domain names
- Regional ACM certificates
- CloudFormation exports for other stacks

**Exports:**
- `HostedZoneId` - Route53 hosted zone ID
- `DomainName` - Base domain name
- `ApiDomainName` - API Gateway custom domain
- `CloudFrontCertificateArn` - Certificate ARN for CloudFront
- `RegionalCertificateArn` - Certificate ARN for regional services
- `ApiGatewayDomainName` - API Gateway domain configuration

### 3. SecurityStack
Manages security infrastructure.

**Current State:** Placeholder for future security resources

**Planned Resources:**
- VPC and subnets
- Security groups
- Lambda execution roles
- WAF rules and IP sets
- CloudWatch log groups

**Exports:**
- `EnvironmentName` - Current environment name

### 4. DataStack
Manages data layer infrastructure.

**Current State:** Placeholder for future data resources

**Planned Resources:**
- RDS Aurora Serverless PostgreSQL cluster
- DynamoDB tables
- S3 buckets for data storage
- Backup policies and retention rules

**Exports:**
- `DatabaseInstanceClass` - Recommended instance class for environment

## Deployment Modes

### Cloud Mode (Production/Staging/Dev)

Deploy all stacks including Route53 and certificates:

```bash
# Deploy to dev environment
nx deploy services-framework --args="--env=dev"

# Deploy to a sandbox
nx deploy services-framework --args="--env=dev --sandbox=mysandbox"

# Deploy to production
nx deploy services-framework --args="--env=prod"
```

**Stacks Deployed:**
1. CertificateStack (us-east-1)
2. NetworkingStack
3. SecurityStack
4. DataStack

**Prerequisites:**
- Route53 hosted zone configured
- Domain name registered
- Hosted zone ID configured in stack mappings

### Local Mode (Development)

Deploy only Security and Data stacks for local development:

```bash
# Deploy locally
nx deploy:local services-framework
```

**Stacks Deployed:**
1. SecurityStack
2. DataStack

**Stacks Skipped:**
- CertificateStack (requires Route53)
- NetworkingStack (requires Route53)

## Environment Configuration

Update the environment mappings in each stack for your domains:

### Current Configuration

```typescript
{
  dev: {
    hostedZone: 'Z09011321LBDR3A2J6A1I',
    domainName: 'dev.wellsvile.gov',
  },
  test: {
    hostedZone: 'Z09011321LBDR3A2J6A1I',
    domainName: 'test.wellsvile.gov',
  },
  prod: {
    hostedZone: 'Z09011321LBDR3A2J6A1I',
    domainName: 'prod.wellsvile.gov',
  },
  local: {
    hostedZone: 'N/A',
    domainName: 'localhost',
  },
}
```

## Stack Dependencies

```
CertificateStack (us-east-1)
    │
    └──> NetworkingStack (uses certificate ARN)

SecurityStack (independent)

DataStack (independent)
```

## Available Commands

### Local Development

```bash
nx list:local services-framework        # List stacks
nx synth:local services-framework       # Generate CloudFormation
nx diff:local services-framework        # Show changes
nx deploy:local services-framework      # Deploy to AWS
nx destroy:local services-framework     # Delete resources
```

### Cloud Deployment

```bash
nx synth services-framework --args="--env=dev"
nx diff services-framework --args="--env=dev"
nx deploy services-framework --args="--env=dev"
nx destroy services-framework --args="--env=dev"
```

## Cross-Region Deployment

The CertificateStack must be deployed in `us-east-1` for CloudFront compatibility, while other stacks can be deployed in any region.

The CDK configuration uses `crossRegionReferences: true` to allow the NetworkingStack to reference the certificate ARN from the CertificateStack.

## Sandbox Deployments

Sandboxes allow multiple isolated environments in the same AWS account:

```bash
# Deploy a personal sandbox
nx deploy services-framework --args="--env=dev --sandbox=yourname"
```

This creates:
- Domain: `yourname.dev.wellsvile.gov`
- API Domain: `api.yourname.dev.wellsvile.gov`
- Wildcard cert: `*.yourname.dev.wellsvile.gov`
- Stack names: `service-framework-*-yourname`

## Outputs and Exports

After deployment, view the outputs:

```bash
# List all stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Get specific stack outputs
aws cloudformation describe-stacks --stack-name service-framework-networking

# Get exports (for use by other stacks)
aws cloudformation list-exports
```

## Troubleshooting

### Certificate Validation Timeout

**Issue:** Certificate validation takes too long or fails

**Solution:**
1. Verify Route53 hosted zone is correct
2. Check DNS records were created
3. Wait up to 30 minutes for DNS propagation
4. Verify domain name matches hosted zone

### Cross-Region Reference Errors

**Issue:** Cannot reference certificate from us-east-1

**Solution:**
- Ensure `crossRegionReferences: true` is set
- Verify both stacks use same account
- Check IAM permissions for cross-region access

### Import Errors in Dependent Stacks

**Issue:** Other stacks can't import values

**Solution:**
1. Deploy framework stacks first
2. Verify exports exist: `aws cloudformation list-exports`
3. Check export names match import statements
4. Ensure sandbox suffixes match

## Next Steps

1. Deploy framework services (cloud or local mode)
2. Configure dependent services (authentication, etc.)
3. Add actual resources to SecurityStack (VPC, security groups)
4. Add actual resources to DataStack (databases, storage)

## Related Documentation

- [Local Development Guide](../LOCAL_DEVELOPMENT.md)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Route53 Documentation](https://docs.aws.amazon.com/route53/)
