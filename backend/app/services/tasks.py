from app.core.celery_app import celery_app
import logging

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def run_agent_task(self, agent_id: str, context: dict):
    import asyncio
    from app.agents import AGENT_REGISTRY

    if agent_id not in AGENT_REGISTRY:
        raise ValueError(f"Unknown agent: {agent_id}")

    agent = AGENT_REGISTRY[agent_id]()

    loop = asyncio.new_event_loop()
    try:
        result = loop.run_until_complete(agent.execute(context))
        return result.to_dict()
    except Exception as exc:
        logger.error(f"Agent task failed: {exc}")
        raise self.retry(exc=exc, countdown=60)
    finally:
        loop.close()


@celery_app.task
def scheduled_sensor_polling():
    """Poll all sensors every 5 minutes."""
    logger.info("Running scheduled sensor poll")


@celery_app.task
def scheduled_flood_check():
    """Run flood risk assessment every 30 minutes."""
    import asyncio
    from app.agents.flood_agent import FloodAgent

    agent = FloodAgent()
    loop = asyncio.new_event_loop()
    try:
        result = loop.run_until_complete(agent.execute({}))
        logger.info(f"Flood check complete: {result.result.get('flood_risk', 'unknown')}")
    finally:
        loop.close()
