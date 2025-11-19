/**
 * Datadog設定
 * ECS FargateとRDS PostgreSQLの監視
 */

# Datadogモニター設定（APIエラーレート監視）
resource "datadog_monitor" "api_error_rate" {
  name    = "[${var.environment}] High Error Rate on Bookmark API"
  type    = "metric alert"
  message = <<-EOT
    Error rate is above threshold on {{service.name}}

    Environment: ${var.environment}
    Service: {{service.name}}

    @${var.alert_email}
  EOT

  query = "sum(last_5m):trace.http.request.errors{service:${var.project_name}-api,env:${var.environment}} by {resource_name}.as_count() > 10"

  monitor_thresholds {
    critical = 10
    warning  = 5
  }

  notify_no_data    = false
  renotify_interval = 60
  require_full_window = false

  tags = [
    "service:${var.project_name}-api",
    "env:${var.environment}",
    "managed_by:terraform"
  ]
}

# Datadogモニター設定（APIレイテンシ監視）
resource "datadog_monitor" "api_latency" {
  name    = "[${var.environment}] High Latency on Bookmark API"
  type    = "metric alert"
  message = <<-EOT
    API latency is above threshold on {{service.name}}

    Environment: ${var.environment}
    Service: {{service.name}}
    P95 Latency: {{value}} ms

    @${var.alert_email}
  EOT

  query = "avg(last_5m):p95:trace.http.request.duration{service:${var.project_name}-api,env:${var.environment}} by {resource_name} > 1000"

  monitor_thresholds {
    critical = 1000 # 1秒
    warning  = 500  # 500ms
  }

  notify_no_data    = false
  renotify_interval = 60
  require_full_window = false

  tags = [
    "service:${var.project_name}-api",
    "env:${var.environment}",
    "managed_by:terraform"
  ]
}

# Datadogモニター設定（RDS CPU使用率監視）
resource "datadog_monitor" "rds_cpu" {
  name    = "[${var.environment}] High CPU Usage on RDS PostgreSQL"
  type    = "metric alert"
  message = <<-EOT
    RDS CPU usage is above threshold

    Environment: ${var.environment}
    Instance: {{dbinstanceidentifier.name}}
    CPU: {{value}}%

    @${var.alert_email}
  EOT

  query = "avg(last_10m):avg:aws.rds.cpuutilization{env:${var.environment}} by {dbinstanceidentifier} > 80"

  monitor_thresholds {
    critical = 80
    warning  = 60
  }

  notify_no_data    = false
  renotify_interval = 60
  require_full_window = false

  tags = [
    "service:rds-postgresql",
    "env:${var.environment}",
    "managed_by:terraform"
  ]
}

# Datadogダッシュボード設定（オプション）
resource "datadog_dashboard" "bookmark_manager" {
  title       = "Bookmark Manager - ${var.environment}"
  description = "Overview dashboard for Bookmark Manager application"
  layout_type = "ordered"

  widget {
    timeseries_definition {
      title = "API Request Rate"
      request {
        q = "sum:trace.http.request.hits{service:${var.project_name}-api,env:${var.environment}}.as_count()"
        display_type = "line"
      }
    }
  }

  widget {
    timeseries_definition {
      title = "API Error Rate"
      request {
        q = "sum:trace.http.request.errors{service:${var.project_name}-api,env:${var.environment}}.as_count()"
        display_type = "bars"
      }
    }
  }

  widget {
    timeseries_definition {
      title = "API Latency (P95)"
      request {
        q = "p95:trace.http.request.duration{service:${var.project_name}-api,env:${var.environment}}"
        display_type = "line"
      }
    }
  }

  widget {
    timeseries_definition {
      title = "RDS CPU Utilization"
      request {
        q = "avg:aws.rds.cpuutilization{env:${var.environment}}"
        display_type = "line"
      }
    }
  }

  widget {
    timeseries_definition {
      title = "RDS Database Connections"
      request {
        q = "avg:aws.rds.database_connections{env:${var.environment}}"
        display_type = "line"
      }
    }
  }
}
