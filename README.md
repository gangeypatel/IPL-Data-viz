
# IPL-2025 auction dashboard

This is a complete code for IPL 2025 data visualization dataset that leverages AWS, Apache Superset and React + Vite. 

dataset link : [IPL-2025](https://www.kaggle.com/datasets/souviksamanta1053/ipl-2025-mega-auction-dataset)


## Tech Stack

**Client:** React + Vite, Tailwind CSS , DaisyUI

**Server:** Python, FastAPI, Docker, AWS S3, AWS Glue, AWS Athena, Apache superset


## Installation

### Step 1: Creating AWS services
- Before doing any work in AWS, Go to IAM console and create a user who has following permissions:
```
AmazonAthenaFullAccess
AmazonS3FullAccess
AmazonGlueConsoleFullAccess
IAMFullAccess

```
- For S3 bucket,
    1. Go to s3 console, create bucket with any name.
    2. Add following policy to the bucket
    3. make another bucket with same settings as first bucket(for Athena staging)
```bash
{
"Version": "2012-10-17",
"Statement": [
    {
        "Effect": "Allow",
        "Principal": {
            "Service": "athena.amazonaws.com"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::<s3-bucket-name>/*"
    }
]
}
```

- For Athena, go to athena console and create the database of any name. This database will contain data crawled from s3 bucket.

- Now for creating the AWS Glue crawler, go to the crawler console and follow instructions in [here](https://docs.aws.amazon.com/glue/latest/dg/define-crawler.html) and [here](https://www.youtube.com/watch?v=Y3YqJI5BXJE). 

- The AWS services should be ready to be used now.

### Step 2 : Setting up Apache Superset

- go to the apache superset official site [here](https://superset.apache.org/docs/quickstart).
- run the necessary commands. docker and docker-compose is required for this part. it will build necessary docker containers to run the app.
- after successful build, you can see the app running on ```localhost:8088 ```
- stop the docker container, we have to make some changes into the configuration of the superset.
- in the Superset git folder, go to the ``` /docker/docker-bootstrap.sh ``` and add these lines, we will be needing this to connect Athena to superset.
```
pip install PyAthena[pandas]
pip install PyAthena[SQLAlchemy]

```
- next, in the ```/docker/pythonpath_dev/ ``` folder, there is a superset_config file which allows developers to configure the superset as they like.
- create a python file under the name ```superset_config_docker.py``` and add the following code. This will allow us to embed the dashboard in frontend.

```Python
FEATURE_FLAGS = { 
        "EMBEDDED_SUPERSET": True,
}

WTF_CSRF_ENABLED = False
OVERRIDE_HTTP_HEADERS = {'X-Frame-Options': 'ALLOWALL'}
TALISMAN_ENABLED = False
ENABLE_CORS = True
HTTP_HEADERS={"X-Frame-Options":"ALLOWALL"}  
CORS_OPTIONS = { 
        "supports_credentials": True, 
        "allow_headers": ["*"], 
        "resources": ["*"], 
        "origins": ['*']
    }



GUEST_ROLE_NAME = "Gamma" 
```
- next, build the docker container by running the same commands mentioned in quickstart guide.
- on the Superset GUI, go to '+' -> add dataset -> Source -> select Amazon Athena.
- We need the Athena URI to connect Athena to the Superset which can be found [here](https://superset.apache.org/docs/configuration/databases/)
- Once it's connected, you should be ready to go and create visualizations of your choice with the data available in the Athena tables.
- After creatig the dashboard, click on embed dashboard button which will give us ID of the dashboard which we will be using in frontend to access the dashboard into our UI. 

### Step 3: Setting up backend
After cloning the directory. go to the backend directory by running ```cd backend```.
make an .env file that will contain following info.

```Javascript
AWS_ACCESS_KEY_ID = Your AWS access key id
AWS_SECRET_ACCESS_KEY = Your AWS access key
AWS_REGION = AWS region
S3_BUCKET = s3 bucket name which will contain uploaded data 
GLUE_CRAWLER_NAME = crawler name which will help creating the Athena Table
ATHENA_DATABASE = Athena database creation
ATHENA_OUTPUT = Athena output buckets.

```



run the backend by running below commands

```bash
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
```
After everything is done, run the app by running.

```bash
uvicorn main:app --reload 
```
This should run the app on ``` localhost:8000 ```

### Step 4: The User Interface
- go to the frontend by running ```cd frontend```.
- run following commands:
```
npm install
npm run dev
```
- This should run the app on ```localhost:5173```
- in the ```src/Components/Sample.jsx``` line 7, replace the dashboard ID you got from Apache superset.

All set 🚀. This should create interactive dashboard.

    
## Authors

- [@Gangey Patel](https://www.gangeypatel.com)

