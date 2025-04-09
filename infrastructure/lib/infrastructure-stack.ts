import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfrontorigins from 'aws-cdk-lib/aws-cloudfront-origins'

import config from './config';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'ADOTBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: 'adot-website-bucket',
      publicReadAccess: false,
      versioned: true,
      websiteIndexDocument: 'index.html',
    });

    const distribution = new cloudfront.Distribution(this, 'ADOTDistribution', {
      certificate: certificatemanager.Certificate.fromCertificateArn(this, 'ADOTCertificate', config.acm),
      defaultBehavior: {
        origin: new cloudfrontorigins.S3StaticWebsiteOrigin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
      },
      domainNames: [config.url],
    })

    const deployment = new s3deploy.BucketDeployment(this, 'ADOTDeployment', {
      destinationBucket: bucket,
      distribution: distribution,
      sources: [s3deploy.Source.asset("../dist")],
    })
  }
}
