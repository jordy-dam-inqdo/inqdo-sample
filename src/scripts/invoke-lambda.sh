port=$1

# LAMBDA
obj['9000']='{
   "resource":"/message",
   "path":"/message",
   "httpMethod":"POST",
   "headers":{
      "Accept":"*/*",
      "Accept-Encoding":"gzip, deflate, br",
      "Cache-Control":"no-cache",
      "CloudFront-Forwarded-Proto":"https",
      "CloudFront-Is-Desktop-Viewer":"true",
      "CloudFront-Is-Mobile-Viewer":"false",
      "CloudFront-Is-SmartTV-Viewer":"false",
      "CloudFront-Is-Tablet-Viewer":"false",
      "CloudFront-Viewer-Country":"NL",
      "Content-Type":"application/json",
      "Host":"v4b7xc97ki.execute-api.eu-west-1.amazonaws.com",
      "Postman-Token":"138c6491-46d8-42a4-a9ee-9a90b66e16d5",
      "User-Agent":"PostmanRuntime/7.26.8",
      "Via":"1.1 fd4c476aa3616f643565cbbf3a891a78.cloudfront.net (CloudFront)",
      "X-Amz-Cf-Id":"6V4NnWIPtOVtfOSgClYVPWaAPZy3epHR_L41b5lfL0LIpb0G8CEwAQ==",
      "X-Amzn-Trace-Id":"Root=1-62330ed2-05f8529653d46ff92eba9e08",
      "X-Forwarded-For":"82.72.250.239, 64.252.180.67",
      "X-Forwarded-Port":"443",
      "X-Forwarded-Proto":"https"
   },
   "multiValueHeaders":{
      "Accept":[
         "*/*"
      ],
      "Accept-Encoding":[
         "gzip, deflate, br"
      ],
      "Cache-Control":[
         "no-cache"
      ],
      "CloudFront-Forwarded-Proto":[
         "https"
      ],
      "CloudFront-Is-Desktop-Viewer":[
         "true"
      ],
      "CloudFront-Is-Mobile-Viewer":[
         "false"
      ],
      "CloudFront-Is-SmartTV-Viewer":[
         "false"
      ],
      "CloudFront-Is-Tablet-Viewer":[
         "false"
      ],
      "CloudFront-Viewer-Country":[
         "NL"
      ],
      "Content-Type":[
         "application/json"
      ],
      "Host":[
         "v4b7xc97ki.execute-api.eu-west-1.amazonaws.com"
      ],
      "Postman-Token":[
         "138c6491-46d8-42a4-a9ee-9a90b66e16d5"
      ],
      "User-Agent":[
         "PostmanRuntime/7.26.8"
      ],
      "Via":[
         "1.1 fd4c476aa3616f643565cbbf3a891a78.cloudfront.net (CloudFront)"
      ],
      "X-Amz-Cf-Id":[
         "6V4NnWIPtOVtfOSgClYVPWaAPZy3epHR_L41b5lfL0LIpb0G8CEwAQ=="
      ],
      "X-Amzn-Trace-Id":[
         "Root=1-62330ed2-05f8529653d46ff92eba9e08"
      ],
      "X-Forwarded-For":[
         "82.72.250.239, 64.252.180.67"
      ],
      "X-Forwarded-Port":[
         "443"
      ],
      "X-Forwarded-Proto":[
         "https"
      ]
   },
   "queryStringParameters":"None",
   "multiValueQueryStringParameters":"None",
   "pathParameters":"None",
   "stageVariables":"None",
   "requestContext":{
      "resourceId":"c9ve9k",
      "resourcePath":"/message",
      "httpMethod":"POST",
      "extendedRequestId":"PH9A6HxsjoEF0Zg=",
      "requestTime":"17/Mar/2022:10:34:58 +0000",
      "path":"/prod/message",
      "accountId":"031986729456",
      "protocol":"HTTP/1.1",
      "stage":"prod",
      "domainPrefix":"v4b7xc97ki",
      "requestTimeEpoch":1647513298443,
      "requestId":"8c9f6c4f-2fd0-4cf9-8141-548ae17c826e",
      "identity":{
         "cognitoIdentityPoolId":"None",
         "accountId":"None",
         "cognitoIdentityId":"None",
         "caller":"None",
         "sourceIp":"82.72.250.239",
         "principalOrgId":"None",
         "accessKey":"None",
         "cognitoAuthenticationType":"None",
         "cognitoAuthenticationProvider":"None",
         "userArn":"None",
         "userAgent":"PostmanRuntime/7.26.8",
         "user":"None"
      },
      "domainName":"v4b7xc97ki.execute-api.eu-west-1.amazonaws.com",
      "apiId":"v4b7xc97ki"
   },
   "body":"{\n    \"message\": \"log het event maar!!\"\n}",
   "isBase64Encoded":false
}'

curl -XPOST "http://localhost:{$1}/2015-03-31/functions/function/invocations" -d "${obj[$1]}"
