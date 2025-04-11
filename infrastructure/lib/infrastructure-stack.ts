import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfrontorigins from 'aws-cdk-lib/aws-cloudfront-origins'

import config from './config';
import { CfnRole, Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'ADOTBucket', {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: 'adot-website-bucket',
      publicReadAccess: false,
      versioned: true,
      websiteIndexDocument: 'index.html',
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
    });

    const distribution = new cloudfront.Distribution(this, 'ADOTDistribution', {
      certificate: certificatemanager.Certificate.fromCertificateArn(this, 'ADOTCertificate', config.acm),
      defaultBehavior: {
        origin: new cloudfrontorigins.S3StaticWebsiteOrigin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
      },
      domainNames: [config.url],
      
    })

    const oac = new cloudfront.CfnOriginAccessControl(this, 'ADOT-OAC', {
      originAccessControlConfig: {
        description: 'allows access to bucket from distribution',
        name: 'ADOT-OAC-Config',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      }
    })


    //https://github.com/aws/aws-cdk/issues/21771
    // The stack named ADOTStack failed to deploy: UPDATE_ROLLBACK_COMPLETE: Resource handler returned message: "Invalid request provided: Exactly one of CustomOriginConfig, VpcOriginConfig and S3OriginConfig must be specified" (RequestToken: 16102ea0-f323-9453-35b6-f52b37c79158, HandlerErrorCode: InvalidRequest)
    const cfndistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;

    cfndistribution.addPropertyOverride(
      'DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity',
      undefined
    );

    cfndistribution.addPropertyOverride(
      'DistributionConfig.Origins.0.OriginAccessControlId',
      oac.getAtt('Id')
    );

    bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        conditions: {
          StringEquals: {
            //Only allow cloudfront distributions of the same account to read from bucket
            'AWS:SourceARN': `arn:aws:cloudfront::${
              cdk.Stack.of(this).account
            }:distribution/${distribution.distributionId}`,
          },
        },
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('cloudfront.amazonaws.com')],
        resources: [bucket.bucketArn + '/*'],
      })
    );

    new s3deploy.BucketDeployment(this, 'ADOTDeployment', {
      destinationBucket: bucket,
      distribution: distribution,
      sources: [s3deploy.Source.asset("../dist")],
    })
  }
}
