import config from './config';

export const secrets = {
    cookieSecret: "cookie secret",
    AWSConfig: {
        accessKeyId: "AWS Access ID",
        secretAccessKey: "AWS Secret Key",
        region: config.AWSRegion   
    }
}

export default secrets;


