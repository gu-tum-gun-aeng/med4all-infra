# Before execute this command you should make sure that 
# you already set env AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY 
# point to the target one

export PULUMI_ORG_NAME=med4all

pulumi stack init $PULUMI_ORG_NAME/network
pulumi stack init $PULUMI_ORG_NAME/eks
pulumi stack init $PULUMI_ORG_NAME/nlb
pulumi stack init $PULUMI_ORG_NAME/route53
pulumi stack init $PULUMI_ORG_NAME/apigateway
pulumi stack init $PULUMI_ORG_NAME/msk
pulumi stack init $PULUMI_ORG_NAME/elasticsearch
pulumi stack init $PULUMI_ORG_NAME/rds
pulumi stack init $PULUMI_ORG_NAME/argocd
pulumi stack init $PULUMI_ORG_NAME/s3
pulumi stack init $PULUMI_ORG_NAME/privateHostZone
