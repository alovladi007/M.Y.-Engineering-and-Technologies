{{/*
Expand the name of the chart.
*/}}
{{- define "energy.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "energy.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "energy.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "energy.labels" -}}
helm.sh/chart: {{ include "energy.chart" . }}
{{ include "energy.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "energy.selectorLabels" -}}
app.kubernetes.io/name: {{ include "energy.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Agent labels
*/}}
{{- define "energy.agent.labels" -}}
{{ include "energy.labels" . }}
app.kubernetes.io/component: agent
{{- end }}

{{- define "energy.agent.selectorLabels" -}}
{{ include "energy.selectorLabels" . }}
app.kubernetes.io/component: agent
{{- end }}

{{- define "energy.agent.fullname" -}}
{{ include "energy.fullname" . }}-agent
{{- end }}

{{/*
Energy API labels
*/}}
{{- define "energy.energyApi.labels" -}}
{{ include "energy.labels" . }}
app.kubernetes.io/component: energy-api
{{- end }}

{{- define "energy.energyApi.selectorLabels" -}}
{{ include "energy.selectorLabels" . }}
app.kubernetes.io/component: energy-api
{{- end }}

{{- define "energy.energyApi.fullname" -}}
{{ include "energy.fullname" . }}-energy-api
{{- end }}

{{/*
Controller labels
*/}}
{{- define "energy.controller.labels" -}}
{{ include "energy.labels" . }}
app.kubernetes.io/component: controller
{{- end }}

{{- define "energy.controller.selectorLabels" -}}
{{ include "energy.selectorLabels" . }}
app.kubernetes.io/component: controller
{{- end }}

{{- define "energy.controller.fullname" -}}
{{ include "energy.fullname" . }}-controller
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "energy.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "energy.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
