import axios from 'axios';

const ELASTICSEARCH_URL = '/elasticsearch';
const ELASTICSEARCH_USERNAME = 'elastic'; // Update this with your Elasticsearch username
const ELASTICSEARCH_PASSWORD = 'changeme'; // Update this with your Elasticsearch password
const WINLOGBEAT_INDEX = 'winlogbeat-*';
const METRICBEAT_INDEX = 'metricbeat-*'; // Updated to use wildcard pattern

// Create axios instance with authentication and CORS headers
const elasticClient = axios.create({
  baseURL: ELASTICSEARCH_URL,
  auth: {
    username: ELASTICSEARCH_USERNAME,
    password: ELASTICSEARCH_PASSWORD
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false  // Changed to false to avoid CORS preflight requests
});

// Add request interceptor for logging
elasticClient.interceptors.request.use(
  config => {
    console.log('Making request to Elasticsearch:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
elasticClient.interceptors.response.use(
  response => {
    console.log('Elasticsearch response received:', {
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error:', {
        message: 'Could not connect to Elasticsearch. Please check if the server is running and accessible.',
        details: error,
        url: ELASTICSEARCH_URL,
        auth: {
          username: ELASTICSEARCH_USERNAME,
          password: '***' // masked for security
        }
      });
      throw new Error('Could not connect to Elasticsearch. Please check if the server is running and accessible.');
    }
    
    if (error.response) {
      console.error('Elasticsearch Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url
      });
      throw new Error(`Elasticsearch Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    
    console.error('Unexpected error:', error);
    throw error;
  }
);

// Helper to parse relative time strings like 'now-15m', 'now-1h', 'now-1d', or return ISO if already absolute
function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return timeStr;
  if (timeStr.startsWith('now')) {
    const now = new Date();
    if (timeStr === 'now') return now.toISOString();
    const match = timeStr.match(/^now-(\d+)([smhdw])$/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      let ms = 0;
      switch (unit) {
        case 's': ms = value * 1000; break;
        case 'm': ms = value * 60 * 1000; break;
        case 'h': ms = value * 60 * 60 * 1000; break;
        case 'd': ms = value * 24 * 60 * 60 * 1000; break;
        case 'w': ms = value * 7 * 24 * 60 * 60 * 1000; break;
        default: ms = 0;
      }
      return new Date(now.getTime() - ms).toISOString();
    }
    return now.toISOString();
  }
  // If already ISO or Date, just return as ISO
  try {
    return new Date(timeStr).toISOString();
  } catch {
    return timeStr;
  }
}

export const fetchWinlogbeatData = async (deviceId = null, eventType = null, eventId = null, severityLevel = null, startDate = null, endDate = null) => {
   
  try {
    let query = {
      query: {
        bool: {
          must: [
            {
              match: {
                "event.module": "security"
              }
            }
          ]
        }
      },
      sort: [
        {
          "@timestamp": {
            "order": "desc"
          }
        }
      ],
      size: 100
    };

    // Add custom date range if provided
    if (startDate && endDate) {
      query.query.bool.must.push({
        range: {
          "@timestamp": {
            gte: parseTimeString(startDate),
            lte: parseTimeString(endDate)
          }
        }
      });
    }

    if (deviceId) {
      query.query.bool.must.push({
        term: {
          "winlog.computer_name.keyword": deviceId
        }
      });
    }

    if (eventType) {
      query.query.bool.must.push({
        match: {
          "winlog.event_type.keyword": eventType
        }
      });
    }

    if (eventId) {
      query.query.bool.must.push({
        term: {
          "winlog.event_id": eventId
        }
      });
    }

    if (severityLevel) {
      query.query.bool.must.push({
        match: {
          "winlog.level.keyword": severityLevel
        }
      });
    }

    console.log('Fetching Winlogbeat data from:', `${ELASTICSEARCH_URL}/${WINLOGBEAT_INDEX}/_search`);
    const response = await elasticClient.post(`/${WINLOGBEAT_INDEX}/_search`, query);
     
    if (!response.data || !response.data.hits) {
      throw new Error('Invalid response format from Elasticsearch');
    }

    return response.data.hits.hits.map(hit => ({
      id: hit._id,
      timestamp: hit._source['@timestamp'],
      computerName: hit._source.winlog?.computer_name,
      eventId: hit._source.winlog?.event_id,
      eventType: hit._source.winlog?.event_type,
      level: hit._source.winlog?.level || hit._source.log?.level,
      message: hit._source.message,
      processId: hit._source.winlog?.process?.pid,
      processName: hit._source.winlog?.process?.name,
      providerName: hit._source.winlog?.provider_name,
      source: hit._source.winlog?.source_name,
      outcome: hit._source.event?.outcome,
      subjectUser: `${hit._source.winlog?.event_data?.SubjectUserName || ''}@${hit._source.winlog?.event_data?.SubjectDomainName || ''}`,
      targetUser: `${hit._source.winlog?.event_data?.TargetUserName || ''}@${hit._source.winlog?.event_data?.TargetDomainName || ''}`,
    }));
  } catch (error) {
    console.error('Error fetching Winlogbeat data:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

export const getWinlogbeatStats = async (timeFilter = '24h', deviceId = null, startDate = null, endDate = null) => {
  try {
    const now = new Date();
    let timeRange = {};
    
    // Use custom date range if provided
    if (startDate && endDate) {
      timeRange = {
        range: {
          "@timestamp": {
            gte: parseTimeString(startDate),
            lte: parseTimeString(endDate)
          }
        }
      };
    } else {
      // Calculate time range based on filter
      switch (timeFilter) {
        case '1h':
          timeRange = {
            range: {
              "@timestamp": {
                gte: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
                lte: now.toISOString()
              }
            }
          };
          break;
        case '24h':
          timeRange = {
            range: {
              "@timestamp": {
                gte: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
                lte: now.toISOString()
              }
            }
          };
          break;
        case '7d':
          timeRange = {
            range: {
              "@timestamp": {
                gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                lte: now.toISOString()
              }
            }
          };
          break;
        case '30d':
          timeRange = {
            range: {
              "@timestamp": {
                gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lte: now.toISOString()
              }
            }
          };
          break;
      }
    }

    console.log('Fetching Winlogbeat stats from:', `${ELASTICSEARCH_URL}/${WINLOGBEAT_INDEX}/_search`);
    
    // Fetch a sample document to inspect fields
    const sampleDocResponse = await elasticClient.post(`/${WINLOGBEAT_INDEX}/_search`, {
      size: 1,
      query: {
        bool: {
          must: [
            timeRange,
            {
              match: {
                "event.module": "security"
              }
            }
          ]
        }
      }
    });

    if (sampleDocResponse.data.hits.hits.length > 0) {
      console.log('Sample Winlogbeat Document:', JSON.stringify(sampleDocResponse.data.hits.hits[0]._source, null, 2));
    } else {
      console.log('No sample Winlogbeat document found for the selected time range and query.');
    }

    const response = await elasticClient.post(`/${WINLOGBEAT_INDEX}/_search`, {
      size: 0,
      query: {
        bool: {
          must: [
            timeRange,
            {
              match: {
                "event.module": "security"
              }
            },
            // Add device filter if deviceId is provided
            ...(deviceId ? [{ term: { "winlog.computer_name": deviceId } }] : []),
          ]
        }
      },
      aggs: {
        severity_levels: {
          terms: {
            field: "log.level",
            size: 5
          }
        },
        computer_count: {
          cardinality: {
            field: "winlog.computer_name"
          }
        },
        computers: {
          terms: {
            field: "winlog.computer_name",
            size: 10 // Adjust size as needed to show enough devices
          }
        },
        failed_logons: {
          filter: {
            bool: {
              must: [
                {
                  term: {
                    "winlog.event_id": 4625
                  }
                }
              ]
            }
          }
        },
        event_ids: {
          terms: {
            field: "winlog.event_id",
            size: 50
          }
        },
        event_types: {
          terms: {
            field: "event.type",
            size: 50 // Increased size to get more types if available
          }
        },
        time_series: {
          date_histogram: {
            field: "@timestamp",
            fixed_interval: timeFilter === '1h' ? '5m' : 
                           timeFilter === '24h' ? '1h' : 
                           timeFilter === '7d' ? '12h' : '1d'
          },
          aggs: {
            total_events: {
              value_count: {
                field: "winlog.event_id"
              }
            },
            failed_logons: {
              filter: {
                term: {
                  "winlog.event_id": 4625
                }
              },
              aggs: {
                count: {
                  value_count: {
                    field: "winlog.event_id"
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!response.data || !response.data.aggregations) {
      throw new Error('Invalid response format from Elasticsearch');
    }

    // Log the raw response for debugging
    console.log('Raw Elasticsearch response:', JSON.stringify(response.data, null, 2));

    // Log each aggregation separately for better debugging
    console.log('Severity Levels Aggregation:', response.data.aggregations.severity_levels.buckets);
    console.log('Computers Aggregation:', response.data.aggregations.computers.buckets);
    console.log('Failed Logons Aggregation:', response.data.aggregations.failed_logons.doc_count);
    console.log('Event IDs Aggregation:', response.data.aggregations.event_ids.buckets);
    console.log('Event Types Aggregation:', response.data.aggregations.event_types.buckets);
    console.log('Time Series Aggregation:', response.data.aggregations.time_series.buckets);

    return {
      severityLevels: response.data.aggregations.severity_levels.buckets,
      computers: response.data.aggregations.computers.buckets,
      failedLogons: response.data.aggregations.failed_logons.doc_count,
      eventIds: response.data.aggregations.event_ids.buckets,
      eventTypes: response.data.aggregations.event_types.buckets,
      timeSeries: response.data.aggregations.time_series.buckets.map(bucket => ({
        time: bucket.key,
        events: bucket.total_events.value,
        failedLogons: bucket.failed_logons.count.value
      }))
    };
  } catch (error) {
    console.error('Error fetching Winlogbeat stats:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

export const generateSecurityIssues = async (timeFilter = '24h', startDate = null, endDate = null) => {
  try {
    const now = new Date();
    let timeRange = {};
    
    // Use custom date range if provided
    if (startDate && endDate) {
      timeRange = {
        range: {
          "@timestamp": {
            gte: parseTimeString(startDate),
            lte: parseTimeString(endDate)
          }
        }
      };
    } else {
      // Calculate time range based on filter
      switch (timeFilter) {
        case '1h':
          timeRange = {
            range: {
              "@timestamp": {
                gte: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
                lte: now.toISOString()
              }
            }
          };
          break;
        case '24h':
          timeRange = {
            range: {
              "@timestamp": {
                gte: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
                lte: now.toISOString()
              }
            }
          };
          break;
        case '7d':
          timeRange = {
            range: {
              "@timestamp": {
                gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                lte: now.toISOString()
              }
            }
          };
          break;
        case '30d':
          timeRange = {
            range: {
              "@timestamp": {
                gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lte: now.toISOString()
              }
            }
          };
          break;
      }
    }

    // Get Winlogbeat data for security events
    const winlogbeatResponse = await elasticClient.post(`/${WINLOGBEAT_INDEX}/_search`, {
      size: 0,
      query: {
        bool: {
          must: [
            {
              match: {
                "event.module": "security"
              }
            },
            timeRange
          ]
        }
      },
      aggs: {
        failed_logons: {
          filter: {
            bool: {
              must: [
                {
                  term: {
                    "winlog.event_id": 4625
                  }
                }
              ]
            }
          }
        },
        suspicious_processes: {
          filter: {
            bool: {
              must: [
                {
                  terms: {
                    "winlog.event_id": [4688, 4689] // Process creation and termination
                  }
                }
              ]
            }
          }
        },
        service_changes: {
          filter: {
            bool: {
              must: [
                {
                  terms: {
                    "winlog.event_id": [7040, 7045] // Service start/stop
                  }
                }
              ]
            }
          }
        },
        account_changes: {
          filter: {
            bool: {
              must: [
                {
                  terms: {
                    "winlog.event_id": [4720, 4722, 4724] // Account creation, modification, deletion
                  }
                }
              ]
            }
          }
        },
        failed_logons_by_computer: {
          terms: {
            field: "winlog.computer_name",
            size: 10
          },
          aggs: {
            failed_attempts: {
              filter: {
                term: {
                  "winlog.event_id": 4625
                }
              }
            }
          }
        }
      }
    });

    // Get Metricbeat data for system metrics
    const metricbeatResponse = await elasticClient.post(`/${METRICBEAT_INDEX}/_search`, {
      size: 0,
      query: {
        bool: {
          must: [
            timeRange,
            {
              exists: {
                field: "system.cpu.total.pct"
              }
            }
          ]
        }
      },
      aggs: {
        high_cpu_usage: {
          filter: {
            range: {
              "system.cpu.total.pct": {
                gte: 0.8
              }
            }
          }
        },
        high_memory_usage: {
          filter: {
            range: {
              "system.memory.actual.used.pct": {
                gte: 0.9
              }
            }
          }
        },
        low_disk_space: {
          filter: {
            range: {
              "system.filesystem.used.pct": {
                gte: 0.9
              }
            }
          }
        },
        system_metrics: {
          terms: {
            field: "host.name",
            size: 10
          },
          aggs: {
            latest_cpu: {
              top_hits: {
                size: 1,
                sort: [{"@timestamp": "desc"}],
                _source: ["system.cpu.total.pct"]
              }
            },
            latest_memory: {
              top_hits: {
                size: 1,
                sort: [{"@timestamp": "desc"}],
                _source: ["system.memory.actual.used.pct"]
              }
            },
            latest_disk: {
              top_hits: {
                size: 1,
                sort: [{"@timestamp": "desc"}],
                _source: ["system.filesystem.used.pct"]
              }
            }
          }
        }
      }
    });

    console.log('Metricbeat Response:', JSON.stringify(metricbeatResponse.data, null, 2));

    // Generate issues based on the data
    const issues = [];

    // Security Issues from Winlogbeat
    const failedLogons = winlogbeatResponse.data.aggregations.failed_logons.doc_count;
    if (failedLogons > 0) {
      issues.push({
        id: 'failed-logins',
        title: 'Multiple Failed Login Attempts',
        description: `Detected ${failedLogons} failed login attempts in the last ${timeFilter}`,
        severity: failedLogons > 10 ? 'high' : 'medium',
        type: 'security',
        timestamp: new Date().toISOString(),
        details: {
          count: failedLogons,
          computers: winlogbeatResponse.data.aggregations.failed_logons_by_computer.buckets.map(b => ({
            name: b.key,
            count: b.failed_attempts.doc_count
          }))
        }
      });
    }

    const suspiciousProcesses = winlogbeatResponse.data.aggregations.suspicious_processes.doc_count;
    if (suspiciousProcesses > 0) {
      issues.push({
        id: 'suspicious-processes',
        title: 'Suspicious Process Activity',
        description: `Detected ${suspiciousProcesses} suspicious process creations/terminations`,
        severity: 'medium',
        type: 'security',
        timestamp: new Date().toISOString(),
        details: {
          count: suspiciousProcesses
        }
      });
    }

    const serviceChanges = winlogbeatResponse.data.aggregations.service_changes.doc_count;
    if (serviceChanges > 0) {
      issues.push({
        id: 'service-changes',
        title: 'Service Configuration Changes',
        description: `Detected ${serviceChanges} service start/stop events`,
        severity: 'medium',
        type: 'security',
        timestamp: new Date().toISOString(),
        details: {
          count: serviceChanges
        }
      });
    }

    const accountChanges = winlogbeatResponse.data.aggregations.account_changes.doc_count;
    if (accountChanges > 0) {
      issues.push({
        id: 'account-changes',
        title: 'User Account Modifications',
        description: `Detected ${accountChanges} user account changes`,
        severity: 'high',
        type: 'security',
        timestamp: new Date().toISOString(),
        details: {
          count: accountChanges
        }
      });
    }

    // System Issues from Metricbeat
    const systemMetrics = metricbeatResponse.data.aggregations.system_metrics.buckets;
    
    systemMetrics.forEach(host => {
      const cpuUsage = host.latest_cpu.hits.hits[0]?._source['system.cpu.total.pct'];
      const memoryUsage = host.latest_memory.hits.hits[0]?._source['system.memory.actual.used.pct'];
      const diskUsage = host.latest_disk.hits.hits[0]?._source['system.filesystem.used.pct'];

      if (cpuUsage && cpuUsage >= 0.8) {
        issues.push({
          id: `high-cpu-${host.key}`,
          title: 'High CPU Usage',
          description: `Host ${host.key} is experiencing high CPU utilization (${(cpuUsage * 100).toFixed(1)}%)`,
          severity: 'medium',
          type: 'performance',
          timestamp: new Date().toISOString(),
          details: {
            host: host.key,
            cpuUsage: cpuUsage,
            threshold: 0.8
          }
        });
      }

      if (memoryUsage && memoryUsage >= 0.9) {
        issues.push({
          id: `high-memory-${host.key}`,
          title: 'High Memory Usage',
          description: `Host ${host.key} is experiencing high memory utilization (${(memoryUsage * 100).toFixed(1)}%)`,
          severity: 'medium',
          type: 'performance',
          timestamp: new Date().toISOString(),
          details: {
            host: host.key,
            memoryUsage: memoryUsage,
            threshold: 0.9
          }
        });
      }

      if (diskUsage && diskUsage >= 0.9) {
        issues.push({
          id: `low-disk-space-${host.key}`,
          title: 'Low Disk Space',
          description: `Host ${host.key} is running low on disk space (${(diskUsage * 100).toFixed(1)}% used)`,
          severity: 'high',
          type: 'performance',
          timestamp: new Date().toISOString(),
          details: {
            host: host.key,
            diskUsage: diskUsage,
            threshold: 0.9
          }
        });
      }
    });

    return issues;
  } catch (error) {
    console.error('Error generating security issues:', error);
    throw error;
  }
}; 