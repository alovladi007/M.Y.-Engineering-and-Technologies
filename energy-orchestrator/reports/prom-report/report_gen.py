import os
import requests
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from io import BytesIO
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
PROM_URL = os.getenv("PROM_URL", "http://prometheus:9090")
START = os.getenv("START", "2025-01-01T00:00:00Z")
MID = os.getenv("MID", "2025-01-15T00:00:00Z")
END = os.getenv("END", "2025-01-30T00:00:00Z")
OUT = os.getenv("OUT", "/out/energy-report.pdf")

def query_range(query, start, end, step="5m"):
    """Query Prometheus for time range data"""
    try:
        response = requests.get(
            f"{PROM_URL}/api/v1/query_range",
            params={
                "query": query,
                "start": start,
                "end": end,
                "step": step
            }
        )
        data = response.json()
        if data["status"] == "success" and data["data"]["result"]:
            return data["data"]["result"]
    except Exception as e:
        logger.error(f"Query failed: {e}")
    return []

def calculate_average(time_series):
    """Calculate average from Prometheus time series"""
    if not time_series or not time_series[0]["values"]:
        return 0
    
    values = [float(v[1]) for v in time_series[0]["values"] if v[1] != "NaN"]
    return np.mean(values) if values else 0

def generate_report():
    """Generate energy savings report"""
    logger.info("Generating energy report...")
    
    # Query J/request for baseline and treatment periods
    j_baseline = query_range("energy:cluster_joules_per_request", START, MID)
    j_treatment = query_range("energy:cluster_joules_per_request", MID, END)
    
    # Calculate averages
    avg_baseline = calculate_average(j_baseline)
    avg_treatment = calculate_average(j_treatment)
    
    if avg_baseline > 0:
        savings_pct = ((avg_baseline - avg_treatment) / avg_baseline) * 100
    else:
        savings_pct = 0
    
    logger.info(f"Baseline J/req: {avg_baseline:.1f}")
    logger.info(f"Treatment J/req: {avg_treatment:.1f}")
    logger.info(f"Savings: {savings_pct:.1f}%")
    
    # Create plot
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))
    
    # Plot 1: J/request over time
    if j_baseline:
        times = [datetime.fromtimestamp(float(v[0])) for v in j_baseline[0]["values"]]
        values = [float(v[1]) for v in j_baseline[0]["values"]]
        ax1.plot(times, values, label="Baseline", color="red", alpha=0.7)
    
    if j_treatment:
        times = [datetime.fromtimestamp(float(v[0])) for v in j_treatment[0]["values"]]
        values = [float(v[1]) for v in j_treatment[0]["values"]]
        ax1.plot(times, values, label="Treatment", color="green", alpha=0.7)
    
    ax1.set_title("Cluster Energy Efficiency (Joules/Request)")
    ax1.set_xlabel("Time")
    ax1.set_ylabel("J/request")
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Power consumption
    power_baseline = query_range("sum(node_total_power_watts)", START, MID)
    power_treatment = query_range("sum(node_total_power_watts)", MID, END)
    
    if power_baseline:
        times = [datetime.fromtimestamp(float(v[0])) for v in power_baseline[0]["values"]]
        values = [float(v[1]) for v in power_baseline[0]["values"]]
        ax2.plot(times, values, label="Baseline", color="red", alpha=0.7)
    
    if power_treatment:
        times = [datetime.fromtimestamp(float(v[0])) for v in power_treatment[0]["values"]]
        values = [float(v[1]) for v in power_treatment[0]["values"]]
        ax2.plot(times, values, label="Treatment", color="green", alpha=0.7)
    
    ax2.set_title("Total Cluster Power Consumption")
    ax2.set_xlabel("Time")
    ax2.set_ylabel("Power (Watts)")
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save plot to buffer
    buf = BytesIO()
    plt.savefig(buf, format="png", dpi=150)
    buf.seek(0)
    
    # Create PDF
    c = canvas.Canvas(OUT, pagesize=A4)
    width, height = A4
    
    # Title page
    c.setFont("Helvetica-Bold", 24)
    c.drawString(2*cm, height - 3*cm, "Energy Efficiency Report")
    
    c.setFont("Helvetica", 12)
    c.drawString(2*cm, height - 4.5*cm, f"Report Period: {START[:10]} to {END[:10]}")
    
    # Summary statistics
    c.setFont("Helvetica-Bold", 14)
    c.drawString(2*cm, height - 6*cm, "Executive Summary")
    
    c.setFont("Helvetica", 11)
    summary_y = height - 7*cm
    c.drawString(2*cm, summary_y, f"Baseline Period: {START[:10]} to {MID[:10]}")
    c.drawString(2*cm, summary_y - 0.6*cm, f"Treatment Period: {MID[:10]} to {END[:10]}")
    c.drawString(2*cm, summary_y - 1.2*cm, f"Average J/request (Baseline): {avg_baseline:.1f}")
    c.drawString(2*cm, summary_y - 1.8*cm, f"Average J/request (Treatment): {avg_treatment:.1f}")
    
    # Highlight savings
    c.setFont("Helvetica-Bold", 12)
    if savings_pct > 0:
        c.setFillColorRGB(0, 0.5, 0)  # Green
        c.drawString(2*cm, summary_y - 2.8*cm, f"Energy Savings: {savings_pct:.1f}%")
    else:
        c.setFillColorRGB(0.7, 0, 0)  # Red
        c.drawString(2*cm, summary_y - 2.8*cm, f"Energy Increase: {abs(savings_pct):.1f}%")
    
    c.setFillColorRGB(0, 0, 0)  # Black
    
    # Add recommendations
    c.setFont("Helvetica-Bold", 14)
    c.drawString(2*cm, height - 12*cm, "Recommendations")
    
    c.setFont("Helvetica", 10)
    rec_y = height - 13*cm
    
    if savings_pct > 15:
        recommendations = [
            "• Excellent results - continue current optimization strategy",
            "• Consider expanding to additional namespaces",
            "• Document successful patterns for replication"
        ]
    elif savings_pct > 5:
        recommendations = [
            "• Good progress - fine-tune PID controller gains",
            "• Enable more aggressive power capping during off-peak",
            "• Increase batch sizes for latency-tolerant workloads"
        ]
    else:
        recommendations = [
            "• Review and adjust optimization parameters",
            "• Analyze workload patterns for optimization opportunities",
            "• Consider enabling quantization for inference workloads",
            "• Implement stricter idle consolidation policies"
        ]
    
    for i, rec in enumerate(recommendations):
        c.drawString(2*cm, rec_y - i*0.6*cm, rec)
    
    # New page for graphs
    c.showPage()
    
    # Add graphs
    from reportlab.lib.utils import ImageReader
    img = ImageReader(buf)
    c.drawImage(img, 1*cm, height - 22*cm, width=width - 2*cm, height=20*cm, preserveAspectRatio=True)
    
    # Add footer
    c.setFont("Helvetica", 8)
    c.drawString(2*cm, 1*cm, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    
    # Save PDF
    c.save()
    logger.info(f"Report saved to {OUT}")

if __name__ == "__main__":
    generate_report()
