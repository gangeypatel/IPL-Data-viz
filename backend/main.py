import time
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import boto3
from botocore.exceptions import NoCredentialsError
from io import BytesIO
from dotenv import load_dotenv
from pydantic import BaseModel
import os
import logging

logger = logging.getLogger('uvicorn.error')
load_dotenv()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET = os.getenv("S3_BUCKET")
ATHENA_DATABASE = os.getenv('ATHENA_DATABASE')
ATHENA_OUTPUT = os.getenv('ATHENA_OUTPUT')
ATHENA_OUTPUT_BUCKET = f"s3://{ATHENA_OUTPUT}/"

if not all([AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, S3_BUCKET]):
    raise Exception("Missing one or more AWS environment variables.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

s3_client = boto3.client("s3", aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY, region_name=AWS_REGION)
athena_client = boto3.client('athena', region_name=AWS_REGION, aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)

@app.get('/')
async def root():
    return {"message": "Hello World"}

@app.post("/upload-to-s3/")
async def upload_to_s3(file: UploadFile):
    try:
        
        df = pd.read_csv(file.file, delimiter=',', quotechar='"', engine='python')
        logger.info('----------------------------')
        logger.info(df.columns)
        logger.info('----------------------------')

        df = df.dropna(axis=1, how='all')

        for team_name, group_df in df.groupby('Team'):
            parquet_buffer = BytesIO()
            group_df.to_parquet(parquet_buffer, index=False)

            file_key = f"{file.filename.split('.')[0]}/{team_name}/{file.filename.split('.')[0]}_{team_name}.parquet"

            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=file_key,
                Body=parquet_buffer.getvalue(),
                ContentType="application/octet-stream"
            )

        crawler_name = os.getenv("GLUE_CRAWLER_NAME")
        if not crawler_name:
            raise HTTPException(status_code=500, detail="Glue crawler name is not configured in the environment variables.")

        glue_client = boto3.client('glue', region_name=AWS_REGION, aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)

        response = glue_client.start_crawler(Name=crawler_name)
        logger.info(f"Crawler started: {response}")

        while True:
            status_response = glue_client.get_crawler(Name=crawler_name)
            state = status_response['Crawler']['State']

            if state == 'READY':
                logger.info("Crawler completed successfully.")
                return {
                    "message": f"Partitioned files uploaded successfully to S3 bucket {S3_BUCKET} and Glue Crawler '{crawler_name}' completed successfully.",
                    "crawler_response": response
                }
            elif state == 'FAILED':
                logger.error("Crawler failed.")
                raise HTTPException(status_code=500, detail="Glue Crawler failed. Please check the AWS Glue logs.")
            
            
            logger.info(f"Crawler state: {state}. Waiting for completion...")
            time.sleep(10)

    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Error parsing CSV file. Please check the file format.")
    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="AWS credentials not found.")
    except glue_client.exceptions.CrawlerRunningException:
        raise HTTPException(status_code=400, detail="Glue crawler is already running. Please wait for it to complete.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
