package main

import (
    "fmt"
    "math/rand"
    "net/http"
    "os"
    "os/exec"
    "strconv"
    "strings"
    "time"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
    log "github.com/sirupsen/logrus"
)

var (
    // CPU metrics
    cpuPowerGauge = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "node_cpu_power_watts",
            Help: "CPU power consumption in watts",
        },
        []string{"node", "socket"},
    )
    
    // GPU metrics
    gpuPowerGauge = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "node_gpu_power_watts",
            Help: "GPU power consumption in watts",
        },
        []string{"node", "gpu_index"},
    )
    
    gpuTempGauge = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "node_gpu_temperature_celsius",
            Help: "GPU temperature in Celsius",
        },
        []string{"node", "gpu_index"},
    )
    
    gpuUtilGauge = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "node_gpu_utilization_percent",
            Help: "GPU utilization percentage",
        },
        []string{"node", "gpu_index"},
    )
    
    gpuMemoryGauge = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "node_gpu_memory_used_bytes",
            Help: "GPU memory used in bytes",
        },
        []string{"node", "gpu_index"},
    )
    
    // Rack/Node power (via IPMI/Redfish stub)
    nodePowerGauge = prometheus.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "node_total_power_watts",
            Help: "Total node power consumption in watts",
        },
        []string{"node"},
    )
)

func init() {
    prometheus.MustRegister(cpuPowerGauge)
    prometheus.MustRegister(gpuPowerGauge)
    prometheus.MustRegister(gpuTempGauge)
    prometheus.MustRegister(gpuUtilGauge)
    prometheus.MustRegister(gpuMemoryGauge)
    prometheus.MustRegister(nodePowerGauge)
}

// Read Intel RAPL (Running Average Power Limit)
func readRAPL() (float64, error) {
    // Try to read from RAPL sysfs
    raplPath := "/sys/class/powercap/intel-rapl/intel-rapl:0/energy_uj"
    data, err := os.ReadFile(raplPath)
    if err != nil {
        // Fallback to mock data for development
        return 95.0 + rand.Float64()*20, nil
    }
    
    energy, err := strconv.ParseFloat(strings.TrimSpace(string(data)), 64)
    if err != nil {
        return 0, err
    }
    
    // Convert microjoules to watts (simplified)
    return energy / 1000000.0, nil
}

// Read NVIDIA GPU metrics via nvidia-smi
func readNvidiaGPU(index int) (power, temp, util, memory float64, err error) {
    // Try nvidia-smi
    cmd := exec.Command("nvidia-smi",
        "--query-gpu=power.draw,temperature.gpu,utilization.gpu,memory.used",
        "--format=csv,noheader,nounits",
        fmt.Sprintf("-i=%d", index))
    
    output, err := cmd.Output()
    if err != nil {
        // Mock data for development
        power = 180.0 + rand.Float64()*70
        temp = 65.0 + rand.Float64()*15
        util = 60.0 + rand.Float64()*30
        memory = float64(8 * 1024 * 1024 * 1024) // 8GB
        return power, temp, util, memory, nil
    }
    
    fields := strings.Split(strings.TrimSpace(string(output)), ",")
    if len(fields) >= 4 {
        power, _ = strconv.ParseFloat(strings.TrimSpace(fields[0]), 64)
        temp, _ = strconv.ParseFloat(strings.TrimSpace(fields[1]), 64)
        util, _ = strconv.ParseFloat(strings.TrimSpace(fields[2]), 64)
        memMB, _ := strconv.ParseFloat(strings.TrimSpace(fields[3]), 64)
        memory = memMB * 1024 * 1024 // Convert MB to bytes
    }
    
    return
}

// Read total node power (IPMI/Redfish stub)
func readNodePower() float64 {
    // In production, this would query BMC via IPMI or Redfish
    // For now, aggregate CPU + GPU + overhead
    cpuPower, _ := readRAPL()
    gpuPower := 0.0
    
    for i := 0; i < getGPUCount(); i++ {
        p, _, _, _, _ := readNvidiaGPU(i)
        gpuPower += p
    }
    
    // Add 20% overhead for other components
    return (cpuPower + gpuPower) * 1.2
}

func getGPUCount() int {
    // Try to detect GPU count
    cmd := exec.Command("nvidia-smi", "-L")
    output, err := cmd.Output()
    if err != nil {
        return 2 // Mock 2 GPUs for development
    }
    return strings.Count(string(output), "GPU")
}

func collectMetrics() {
    nodeName := os.Getenv("NODE_NAME")
    if nodeName == "" {
        nodeName = "energy-node-1"
    }
    
    for {
        // Collect CPU metrics
        cpuPower, _ := readRAPL()
        cpuPowerGauge.WithLabelValues(nodeName, "0").Set(cpuPower)
        
        // Collect GPU metrics
        gpuCount := getGPUCount()
        for i := 0; i < gpuCount; i++ {
            power, temp, util, memory, _ := readNvidiaGPU(i)
            gpuPowerGauge.WithLabelValues(nodeName, fmt.Sprintf("%d", i)).Set(power)
            gpuTempGauge.WithLabelValues(nodeName, fmt.Sprintf("%d", i)).Set(temp)
            gpuUtilGauge.WithLabelValues(nodeName, fmt.Sprintf("%d", i)).Set(util)
            gpuMemoryGauge.WithLabelValues(nodeName, fmt.Sprintf("%d", i)).Set(memory)
        }
        
        // Collect total node power
        nodePower := readNodePower()
        nodePowerGauge.WithLabelValues(nodeName).Set(nodePower)
        
        time.Sleep(10 * time.Second)
    }
}

func main() {
    log.Info("Starting Energy Agent Exporter...")
    
    // Start metrics collection
    go collectMetrics()
    
    // Expose metrics endpoint
    http.Handle("/metrics", promhttp.Handler())
    
    port := os.Getenv("PORT")
    if port == "" {
        port = "9100"
    }
    
    log.Infof("Listening on :%s", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}
