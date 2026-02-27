import { ref, computed } from 'vue';
import { initialInfrastructure, initialBusiness, initialProjects, initialProductionMonitors, initialAlertRules, initialAlertChannels, initialAlertEvents, type Monitor, type Project, type AlertRule, type AlertChannel, type AlertEvent, type LogEntry, type LogLevel, type MetricSeries, type TimeSeriesPoint, type MonitorStatus } from './mockData';

// State is reactive to be shared if needed, or we can just return refs
// For simplicity in simulation, we'll keep a local state and expose it
const projectsForSim = ref<Project[]>(JSON.parse(JSON.stringify(initialProjects)));
const monitorsForSim = ref<Monitor[]>(JSON.parse(JSON.stringify([...initialInfrastructure, ...initialBusiness, ...initialProductionMonitors])));
const infrastructureForSim = computed(() => monitorsForSim.value.filter(m => m.category === 'infrastructure' || (!m.category && ['api', 'mq', 'search', 'db', 'cache'].includes(m.type))));
const businessForSim = computed(() => monitorsForSim.value.filter(m => m.category === 'business' || (!m.category && m.type === 'order')));

const alertRulesForSim = ref<AlertRule[]>(JSON.parse(JSON.stringify(initialAlertRules)));
const alertChannelsForSim = ref<AlertChannel[]>(JSON.parse(JSON.stringify(initialAlertChannels)));
const alertEventsForSim = ref<AlertEvent[]>(JSON.parse(JSON.stringify(initialAlertEvents)));

let intervalId: number | null = null;

const randomStatus = (): MonitorStatus => {
    const rand = Math.random();
    if (rand > 0.9) return 'error';
    if (rand > 0.8) return 'slow';
    return 'ok';
};

const randomLatency = (base: number) => {
    return Math.floor(base + Math.random() * 50) + 'ms';
};

const simulateUpdates = () => {
    monitorsForSim.value.forEach(m => {
        // Switch type: 5% chance to toggle on/off
        if (m.type === 'switch') {
            if (Math.random() > 0.95) {
                m.status = m.status === 'on' ? 'off' : 'on';
                m.history.shift();
                m.history.push(m.status);
            }
            return;
        }

        // Regular monitors
        if (Math.random() > 0.7) {
            const newStatus = randomStatus();
            m.status = newStatus;

            // Push to history
            m.history.shift();
            m.history.push(newStatus);

            // Update metrics based on status
            if (m.type === 'api') {
                m.metrics[1].value = newStatus === 'slow' ? randomLatency(200) : randomLatency(30);
            }

            // Add events on error
            if (newStatus === 'error' && (!m.events || m.events[0].msg !== 'Simulated Error')) {
                if (!m.events) m.events = [];
                m.events.unshift({
                    time: 'Just now',
                    msg: 'Simulated Error: connection drop'
                });
                if (m.events.length > 5) m.events.pop();
            }
        }
    });
};

export const getMonitorIdsForProject = (projectId: string): Set<string> => {
    const ids = new Set<string>();
    for (const m of monitorsForSim.value) {
        if (m.projectId === projectId) ids.add(m.id);
    }
    return ids;
};

export const getMonitorsForProject = (projectId: string): { id: string; name: string; nameKey: string; metricKeys?: string[] }[] => {
    const result: { id: string; name: string; nameKey: string; metricKeys?: string[] }[] = [];
    for (const m of monitorsForSim.value) {
        if (m.projectId === projectId) {
            const metricKeys = m.metrics.map(met => {
                const key = met.labelKey.replace('metric.', '');
                return key;
            });
            result.push({ id: m.id, name: m.name || m.nameKey || m.id, nameKey: m.nameKey, metricKeys });
        }
    }
    return result;
};

export const useMockService = () => {
    const getMonitors = async (projectId: string) => {
        await new Promise(r => setTimeout(r, 500));
        return ref(monitorsForSim.value.filter(m => m.projectId === projectId));
    };

    const getInfrastructure = async (projectId: string) => {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 500));
        return ref(infrastructureForSim.value.filter(m => m.projectId === projectId));
    };

    const getBusiness = async (projectId: string) => {
        await new Promise(r => setTimeout(r, 500));
        return ref(businessForSim.value.filter(m => m.projectId === projectId));
    };

    const startSimulation = () => {
        if (intervalId) return;
        console.log('Starting simulation...');
        intervalId = setInterval(simulateUpdates, 3000); // Update every 3 seconds
    };

    const stopSimulation = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            console.log('Simulation stopped.');
        }
    };

    const getProjects = async () => {
        await new Promise(r => setTimeout(r, 200));
        return projectsForSim;
    };

    const RESERVED_CODES = ['settings', 'admin', 'api', 'auth', 'login'];

    const generateCode = (name: string): string => {
        let code = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
        if (RESERVED_CODES.includes(code)) {
            code = `${code}-project`;
        }
        // Deduplicate: if code already exists, append a suffix
        const existing = projectsForSim.value.map(p => p.code);
        let final = code;
        let i = 1;
        while (existing.includes(final)) {
            final = `${code}-${i++}`;
        }
        return final;
    };

    const addProject = async (name: string, desc: string) => {
        await new Promise(r => setTimeout(r, 300));
        const code = generateCode(name);
        projectsForSim.value.push({
            id: Date.now().toString(),
            code,
            nameKey: '',
            rawName: name,
            desc: desc,
            status: 'ok'
        });
        return code;
    };

    const addMonitor = async (monitor: Partial<Monitor>, group: 'infrastructure' | 'business' | 'service' | 'switch', projectId: string) => {
        await new Promise(r => setTimeout(r, 300));
        const categoryMap: Record<string, Monitor['category']> = {
            infrastructure: 'infrastructure',
            business: 'business',
            service: 'service',
            switch: 'switch'
        };
        const newMonitor: Monitor = {
            id: Date.now().toString(),
            projectId,
            nameKey: '',
            name: monitor.name || '',
            desc: monitor.desc || 'No description',
            status: group === 'switch' ? 'off' : 'ok',
            type: monitor.type || 'api',
            category: categoryMap[group],
            metrics: [
                { labelKey: 'metric.uptime', value: '100%', status: 'good' },
                { labelKey: 'metric.latency', value: '20ms' }
            ],
            history: ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok'],
            ...monitor
        };

        monitorsForSim.value.push(newMonitor);
    };

    const getMonitorById = (id: string): Monitor | undefined => {
        return monitorsForSim.value.find(m => m.id === id);
    };

    // Alert Rules CRUD
    const getAlertRules = async () => {
        await new Promise(r => setTimeout(r, 300));
        return alertRulesForSim;
    };

    const createAlertRule = async (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => {
        await new Promise(r => setTimeout(r, 300));
        const now = new Date().toISOString();
        const newRule: AlertRule = {
            ...rule,
            id: 'rule-' + Date.now(),
            createdAt: now,
            updatedAt: now
        };
        alertRulesForSim.value.push(newRule);
        return newRule;
    };

    const updateAlertRule = async (id: string, updates: Partial<AlertRule>) => {
        await new Promise(r => setTimeout(r, 300));
        const idx = alertRulesForSim.value.findIndex(r => r.id === id);
        if (idx !== -1) {
            alertRulesForSim.value[idx] = { ...alertRulesForSim.value[idx], ...updates, updatedAt: new Date().toISOString() };
        }
    };

    const deleteAlertRule = async (id: string) => {
        await new Promise(r => setTimeout(r, 200));
        alertRulesForSim.value = alertRulesForSim.value.filter(r => r.id !== id);
    };

    // Alert Channels CRUD
    const getAlertChannels = async () => {
        await new Promise(r => setTimeout(r, 300));
        return alertChannelsForSim;
    };

    const createAlertChannel = async (channel: Omit<AlertChannel, 'id' | 'createdAt' | 'enabled'>) => {
        await new Promise(r => setTimeout(r, 300));
        const newChannel: AlertChannel = {
            ...channel,
            enabled: true,
            id: 'ch-' + Date.now(),
            createdAt: new Date().toISOString()
        };
        alertChannelsForSim.value.push(newChannel);
        return newChannel;
    };

    const updateAlertChannel = async (id: string, updates: Partial<AlertChannel>) => {
        await new Promise(r => setTimeout(r, 300));
        const idx = alertChannelsForSim.value.findIndex(c => c.id === id);
        if (idx !== -1) {
            alertChannelsForSim.value[idx] = { ...alertChannelsForSim.value[idx], ...updates };
        }
    };

    const deleteAlertChannel = async (id: string) => {
        await new Promise(r => setTimeout(r, 200));
        alertChannelsForSim.value = alertChannelsForSim.value.filter(c => c.id !== id);
    };

    // Alert Events
    const getAlertEvents = async () => {
        await new Promise(r => setTimeout(r, 300));
        return alertEventsForSim;
    };

    // Logs - procedurally generated
    const getLogs = async (monitorId: string, filters?: { level?: LogLevel; keyword?: string }) => {
        await new Promise(r => setTimeout(r, 400));
        const monitor = getMonitorById(monitorId);
        const monitorType = monitor?.type || 'api';
        const source = monitor ? (monitor.desc || monitorId) : monitorId;

        const messageTemplates: Record<string, string[]> = {
            api: [
                'GET /api/v1/health 200 OK',
                'POST /api/v1/orders 201 Created',
                'GET /api/v1/users 200 OK',
                'Connection pool exhausted, waiting for available connection',
                'Rate limit exceeded for client 10.0.0.5',
                'TLS handshake completed in 12ms',
                'Request timeout after 5000ms for /api/v1/search',
                'Circuit breaker OPEN for downstream service payment-svc',
                'Retrying request to inventory-svc (attempt 2/3)',
                'Response cached for /api/v1/products, TTL 60s'
            ],
            mq: [
                'Consumer connected to queue order.created',
                'Message published to exchange order.events',
                'Queue order.dlq has 15 messages',
                'Connection lost to broker, reconnecting...',
                'Channel closed unexpectedly: RESOURCE_LOCKED',
                'Prefetch count set to 50 for consumer tag ctag-001',
                'Message acknowledged: delivery-tag 1842',
                'Heartbeat timeout, connection reset',
                'Queue order.created declared with 2340 messages ready',
                'Consumer cancelled by broker: queue deleted'
            ],
            search: [
                'Index order-2026.02 created with 5 shards',
                'Search query took 850ms on index products',
                'Cluster health changed to YELLOW',
                'Shard relocation started: index users, shard 2',
                'Bulk indexing 5000 documents completed in 3.2s',
                'Query cache eviction: memory pressure at 85%',
                'Slow query detected: wildcard search on field description',
                'Snapshot backup-daily completed successfully',
                'Node es-03 joined the cluster',
                'Index merge completed for order-2026.01'
            ],
            order: [
                'Order ORD-999 created successfully',
                'Payment initiated for order ORD-999',
                'Stock reserved for SKU-1234 qty=2',
                'Payment callback timeout for order ORD-998',
                'Order ORD-997 status changed to COMPLETED',
                'Inventory check failed: insufficient stock for SKU-5678',
                'Refund processed for order ORD-995 amount=129.00',
                'Order ORD-996 cancelled by user',
                'Payment provider returned 504 Gateway Timeout',
                'Compensation triggered: releasing stock for ORD-994'
            ],
            db: [
                'Connection pool size: 45/100 active',
                'Slow query detected: SELECT * FROM orders WHERE... (2.3s)',
                'Replication lag: 150ms behind primary',
                'Deadlock detected on table order_items',
                'Query plan changed for frequently executed query #42',
                'Vacuum completed on table users (12000 dead tuples removed)',
                'Connection from 10.0.1.5 established',
                'Transaction rollback: serialization failure',
                'Index scan on orders.created_at, 4200 rows examined',
                'Checkpoint completed: wrote 2048 buffers'
            ],
            cache: [
                'Cache hit ratio: 94.2% (last 5 min)',
                'Key eviction: memory usage at maxmemory limit',
                'Connected clients: 128',
                'Slow command detected: KEYS pattern (45ms)',
                'Cluster node 10.0.2.3:6379 marked as failing',
                'RDB snapshot saved to disk successfully',
                'Keyspace notification: expired key session:abc123',
                'Master-replica sync completed in 2.1s',
                'Pub/Sub message delivered to 3 subscribers on channel events',
                'Memory fragmentation ratio: 1.23'
            ],
            ecs: [
                'Task arn:ecs:task/abc123 status: RUNNING',
                'Service order-processor desired count updated to 5',
                'Task stopped: exit code 137 (OOMKilled)',
                'Container health check passed on port 8080',
                'Auto-scaling triggered: CPU utilization 85%',
                'Task placement constraint evaluated: spread across AZs',
                'Deployment rollout 50% complete',
                'Service discovery registration updated',
                'Task definition revision 42 activated',
                'Container instance i-0abc123 draining'
            ],
            crawler: [
                'Browser instance #5 launched: headless Chrome 120',
                'Page navigation completed: https://example.com/products (2.1s)',
                'Screenshot captured for page validation',
                'Browser recycled after 50 page loads',
                'Rate limit detected: 429 Too Many Requests',
                'Proxy rotated to 10.0.5.12:8080',
                'JavaScript rendering completed in 1.8s',
                'Cookie consent dialog dismissed',
                'Data extraction: 245 items scraped from listing page',
                'Memory leak detected in browser #12: 1.2GB RSS'
            ],
            switch: [
                'Switch state checked: ON',
                'Toggle request received from ops-admin',
                'Pre-check validation passed: inventory=15000',
                'Switch toggled ON at 14:00:00 UTC',
                'Downstream services notified of state change',
                'Rate limiter activated: 1000 req/s',
                'Switch health check passed',
                'Rollback plan verified: auto-off after 2h',
                'Monitoring alert threshold updated for flash sale',
                'Switch audit log entry created'
            ],
            chatbot: [
                'Session started: user-abc123, model=gpt-4',
                'Response generated in 1.2s, tokens=450',
                'Knowledge base query: 3 relevant documents found',
                'Fallback to human agent: confidence below threshold',
                'Session ended: satisfaction score 4.5/5',
                'Model inference batch processed: 12 requests',
                'Context window managed: truncated to 8000 tokens',
                'Intent classified: order_inquiry (confidence: 0.92)',
                'Response cached for common query: shipping policy',
                'Concurrent sessions: 156 active, 12 queued'
            ]
        };

        const templates = messageTemplates[monitorType] || messageTemplates.api;
        const levels: LogLevel[] = ['info', 'info', 'info', 'info', 'warn', 'warn', 'error', 'debug', 'debug', 'info'];
        const logs: LogEntry[] = [];
        const baseTime = new Date('2026-02-27T14:25:00Z');

        for (let i = 0; i < 50; i++) {
            const time = new Date(baseTime.getTime() - i * 15000); // 15s intervals
            const level = i < 3 && monitorType === 'mq' ? 'error' : levels[i % levels.length];
            const msg = templates[i % templates.length];
            logs.push({
                id: `log-${monitorId}-${i}`,
                time: time.toISOString().replace('T', ' ').substring(0, 19),
                level,
                message: msg,
                source,
                traceId: Math.random() > 0.5 ? `trace-${Math.random().toString(36).substring(2, 10)}` : undefined
            });
        }

        let filtered = logs;
        if (filters?.level) {
            filtered = filtered.filter(l => l.level === filters.level);
        }
        if (filters?.keyword) {
            const kw = filters.keyword.toLowerCase();
            filtered = filtered.filter(l => l.message.toLowerCase().includes(kw));
        }

        return filtered;
    };

    // Charts - time series generation
    const getMetricHistory = async (monitorId: string, metricKey: string, range: string): Promise<MetricSeries> => {
        await new Promise(r => setTimeout(r, 300));
        const configs: Record<string, { points: number; interval: number }> = {
            '1h': { points: 60, interval: 60000 },
            '6h': { points: 72, interval: 300000 },
            '24h': { points: 96, interval: 900000 },
            '7d': { points: 84, interval: 7200000 }
        };
        const cfg = configs[range] || configs['1h'];
        const baseTime = new Date('2026-02-27T14:25:00Z');
        const data: TimeSeriesPoint[] = [];
        const baseValues: Record<string, { base: number; variance: number; unit: string }> = {
            latency: { base: 45, variance: 30, unit: 'ms' },
            uptime: { base: 99, variance: 2, unit: '%' },
            successRate: { base: 92, variance: 8, unit: '%' },
            avgDuration: { base: 1800, variance: 500, unit: 'ms' },
            throughput: { base: 250, variance: 80, unit: 'req/min' },
            errorRate: { base: 3, variance: 5, unit: '%' },
            runningCount: { base: 4, variance: 2, unit: 'count' },
            pageLoadTime: { base: 3000, variance: 1500, unit: 'ms' },
            responseTime: { base: 1800, variance: 600, unit: 'ms' },
            activeSessions: { base: 150, variance: 50, unit: 'count' },
            queueDepth: { base: 5000, variance: 4000, unit: 'count' }
        };
        const config = baseValues[metricKey] || { base: 50, variance: 20, unit: '' };

        for (let i = 0; i < cfg.points; i++) {
            const time = new Date(baseTime.getTime() - (cfg.points - i) * cfg.interval);
            const noise = (Math.random() - 0.5) * 2 * config.variance;
            // Add occasional spikes
            const spike = Math.random() > 0.92 ? config.variance * 2 : 0;
            data.push({
                time: time.toISOString(),
                value: Math.max(0, Math.round((config.base + noise + spike) * 10) / 10)
            });
        }

        return { metricKey, unit: config.unit, data };
    };

    const getMonitorMetricSeries = async (monitorId: string, range: string): Promise<MetricSeries[]> => {
        await new Promise(r => setTimeout(r, 400));
        const monitor = getMonitorById(monitorId);
        const type = monitor?.type || 'api';

        const metricsByType: Record<string, string[]> = {
            api: ['latency', 'throughput', 'errorRate'],
            mq: ['latency', 'throughput', 'errorRate'],
            search: ['latency', 'throughput', 'errorRate'],
            order: ['successRate', 'avgDuration', 'throughput'],
            db: ['latency', 'throughput', 'errorRate'],
            cache: ['latency', 'throughput', 'errorRate'],
            ecs: ['runningCount', 'errorRate', 'latency'],
            crawler: ['pageLoadTime', 'throughput', 'errorRate'],
            switch: ['throughput', 'errorRate'],
            chatbot: ['responseTime', 'activeSessions', 'errorRate']
        };

        const metrics = metricsByType[type] || metricsByType.api;
        const series: MetricSeries[] = [];
        for (const key of metrics) {
            series.push(await getMetricHistory(monitorId, key, range));
        }
        return series;
    };

    const getProjectByCode = (code: string) => {
        return projectsForSim.value.find(p => p.code === code);
    };

    return {
        getMonitors,
        getInfrastructure,
        getBusiness,
        getProjects,
        getProjectByCode,
        addProject,
        addMonitor,
        getMonitorById,
        startSimulation,
        stopSimulation,
        getAlertRules,
        createAlertRule,
        updateAlertRule,
        deleteAlertRule,
        getAlertChannels,
        createAlertChannel,
        updateAlertChannel,
        deleteAlertChannel,
        getAlertEvents,
        getLogs,
        getMetricHistory,
        getMonitorMetricSeries
    };
};
