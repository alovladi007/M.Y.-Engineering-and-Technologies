import os
import json
import logging
import requests
import schedule
import time
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
GRAFANA_URL = os.getenv("GRAFANA_URL", "http://grafana:3000")
GRAFANA_TOKEN = os.getenv("GRAFANA_TOKEN", "")
DASHBOARD_UIDS = os.getenv("DASHBOARD_UIDS", "energy-efficiency,app-energy").split(",")
EXPIRES_SECONDS = int(os.getenv("EXPIRES_SECONDS", "86400"))  # 24 hours
SNAPSHOT_NAME_PREFIX = os.getenv("SNAPSHOT_NAME_PREFIX", "energy-auto")

def create_snapshot(dashboard_uid):
    """Create a snapshot for a dashboard"""
    try:
        # Get dashboard
        headers = {
            "Authorization": f"Bearer {GRAFANA_TOKEN}",
            "Content-Type": "application/json"
        }
        
        dash_response = requests.get(
            f"{GRAFANA_URL}/api/dashboards/uid/{dashboard_uid}",
            headers=headers
        )
        dash_response.raise_for_status()
        dashboard = dash_response.json()["dashboard"]
        
        # Create snapshot
        snapshot_data = {
            "dashboard": dashboard,
            "name": f"{SNAPSHOT_NAME_PREFIX}-{dashboard_uid}-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
            "expires": EXPIRES_SECONDS
        }
        
        snap_response = requests.post(
            f"{GRAFANA_URL}/api/snapshots",
            headers=headers,
            json=snapshot_data
        )
        snap_response.raise_for_status()
        
        result = snap_response.json()
        snapshot_url = result.get("url", "")
        snapshot_key = result.get("key", "")
        
        logger.info(f"Created snapshot for {dashboard_uid}: {snapshot_url} (key: {snapshot_key})")
        return snapshot_url, snapshot_key
        
    except Exception as e:
        logger.error(f"Failed to create snapshot for {dashboard_uid}: {e}")
        return None, None

def create_all_snapshots():
    """Create snapshots for all configured dashboards"""
    logger.info("Creating Grafana snapshots...")
    
    results = {}
    for uid in DASHBOARD_UIDS:
        url, key = create_snapshot(uid)
        if url:
            results[uid] = {"url": url, "key": key}
    
    # Log results
    logger.info(f"Snapshot results: {json.dumps(results, indent=2)}")
    
    # Optionally save to file or send to webhook
    if os.getenv("WEBHOOK_URL"):
        try:
            requests.post(
                os.getenv("WEBHOOK_URL"),
                json={
                    "timestamp": datetime.utcnow().isoformat(),
                    "snapshots": results
                }
            )
        except Exception as e:
            logger.error(f"Failed to send webhook: {e}")

def main():
    logger.info("Grafana Snapshotter started")
    logger.info(f"Dashboards to snapshot: {DASHBOARD_UIDS}")
    logger.info(f"Snapshot expiry: {EXPIRES_SECONDS}s")
    
    # Schedule daily snapshots at 2 AM
    schedule.every().day.at("02:00").do(create_all_snapshots)
    
    # Create initial snapshot
    create_all_snapshots()
    
    while True:
        schedule.run_pending()
        time.sleep(3600)  # Check every hour

if __name__ == "__main__":
    main()
