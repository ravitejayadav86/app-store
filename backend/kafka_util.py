import os
import json
import asyncio
from aiokafka import AIOKafkaProducer
from dotenv import load_dotenv

load_dotenv()

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

class KafkaManager:
    def __init__(self):
        self.producer = None

    async def start(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await self.producer.start()

    async def stop(self):
        if self.producer:
            await self.producer.stop()

    async def send_event(self, topic: str, message: dict):
        if self.producer:
            await self.producer.send_and_wait(topic, message)

kafka_manager = KafkaManager()

async def log_request_to_kafka(request_data: dict):
    try:
        await kafka_manager.send_event("api_requests", request_data)
    except Exception as e:
        print(f"Failed to send event to Kafka: {e}")
