import os
import time
import logging
import schedule
from datetime import datetime
import pytz
from kubernetes import client, config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Kubernetes config
try:
    config.load_incluster_config()
except:
    config.load_kube_config()

v1 = client.CoreV1Api()
apps_v1 = client.AppsV1Api()

# Configuration
GREEN_WINDOWS = os.getenv("GREEN_WINDOWS", "00:00-06:00,22:00-24:00")  # UTC
TARGET_NAMESPACES = os.getenv("TARGET_NAMESPACES", "default,batch-jobs").split(",")
POWER_RELAX_PERCENT = float(os.getenv("POWER_RELAX_PERCENT", "5"))  # 5% relaxation
BATCH_BUMP = int(os.getenv("BATCH_BUMP", "1"))  # +1 batch size

def parse_time_windows(windows_str):
    """Parse time windows from string format"""
    windows = []
    for window in windows_str.split(","):
        start_str, end_str = window.strip().split("-")
        start_h, start_m = map(int, start_str.split(":"))
        end_h, end_m = map(int, end_str.split(":"))
        windows.append(((start_h, start_m), (end_h, end_m)))
    return windows

def is_green_window():
    """Check if current time is in a green window"""
    now = datetime.now(pytz.UTC)
    current_time = (now.hour, now.minute)
    
    windows = parse_time_windows(GREEN_WINDOWS)
    for (start, end) in windows:
        if start <= end:
            if start <= current_time <= end:
                return True
        else:  # Window crosses midnight
            if current_time >= start or current_time <= end:
                return True
    return False

def update_namespace_annotation(namespace, is_green):
    """Update namespace annotation for green window status"""
    try:
        ns = v1.read_namespace(namespace)
        annotations = ns.metadata.annotations or {}
        annotations["energy.yourorg.io/green-window"] = str(is_green).lower()
        
        v1.patch_namespace(namespace, {"metadata": {"annotations": annotations}})
        logger.info(f"Updated namespace {namespace} green-window={is_green}")
    except Exception as e:
        logger.error(f"Failed to update namespace {namespace}: {e}")

def adjust_deployments(namespace, is_green):
    """Adjust deployment power caps and batch hints based on green window"""
    try:
        deployments = apps_v1.list_namespaced_deployment(namespace)
        
        for deployment in deployments.items:
            # Skip if no energy annotations
            if not deployment.spec.template.metadata.annotations:
                continue
            
            annotations = deployment.spec.template.metadata.annotations
            base_cap_key = "energy.yourorg.io/base-gpu-power-cap-w"
            current_cap_key = "energy.yourorg.io/gpu-power-cap-w"
            
            # Get or set base power cap
            if base_cap_key not in annotations and current_cap_key in annotations:
                annotations[base_cap_key] = annotations[current_cap_key]
            
            if base_cap_key in annotations:
                base_cap = int(annotations[base_cap_key])
                
                if is_green:
                    # Relax power cap during green window
                    new_cap = min(300, int(base_cap * (1 + POWER_RELAX_PERCENT/100)))
                else:
                    # Return to base cap
                    new_cap = base_cap
                
                if annotations.get(current_cap_key) != str(new_cap):
                    annotations[current_cap_key] = str(new_cap)
                    
                    # Also adjust batch hint
                    for container in deployment.spec.template.spec.containers:
                        if container.env:
                            for env in container.env:
                                if env.name == "ENERGY_BATCH_HINT":
                                    current_batch = int(env.value)
                                    if is_green:
                                        env.value = str(min(8, current_batch + BATCH_BUMP))
                                    else:
                                        env.value = str(max(1, current_batch - BATCH_BUMP))
                                    break
                    
                    # Apply changes
                    apps_v1.patch_namespaced_deployment(
                        deployment.metadata.name,
                        namespace,
                        deployment
                    )
                    logger.info(f"Adjusted {deployment.metadata.name}: cap={new_cap}W, green={is_green}")
                    
    except Exception as e:
        logger.error(f"Failed to adjust deployments in {namespace}: {e}")

def check_and_apply():
    """Main check and apply green window settings"""
    is_green = is_green_window()
    logger.info(f"Green window status: {is_green}")
    
    for namespace in TARGET_NAMESPACES:
        update_namespace_annotation(namespace, is_green)
        adjust_deployments(namespace, is_green)

def main():
    logger.info(f"Green Window Operator started")
    logger.info(f"Green windows (UTC): {GREEN_WINDOWS}")
    logger.info(f"Target namespaces: {TARGET_NAMESPACES}")
    
    # Schedule checks every 5 minutes
    schedule.every(5).minutes.do(check_and_apply)
    
    # Initial check
    check_and_apply()
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main()
