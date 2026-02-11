export interface Project {
    id: string;
    nameKey: string; // Using nameKey for i18n, but simulate dynamic ones having raw names
    rawName?: string;
    desc?: string; // New field for UX
    status: 'ok' | 'error' | 'warning';
}

export const initialProjects: Project[] = [
    { id: '1', nameKey: 'project.ecommerce', status: 'error' },
    { id: '2', nameKey: 'project.payment', status: 'ok' },
    { id: '3', nameKey: 'project.user', status: 'warning' }
];

export interface MonitorMetric {
    labelKey: string;
    value: string;
    status?: 'good' | 'bad';
}

export interface MonitorEvent {
    time: string;
    msg: string;
    id?: string;
    flow?: { name: string; status: 'ok' | 'error' }[];
}

export interface MonitorAgent {
    steps?: { title: string; desc: string }[];
    rootCause?: { title: string; desc: string; confidence?: string };
}

export interface FlowStepDetail {
    name: string;
    status: 'ok' | 'error' | 'pending';
    duration?: string;
    endpoint?: string;
    threshold?: string;
    startedAt?: string;
    retries?: number;
    throughput?: string;
    p99?: string;
    errorMessage?: string;
}

export interface HistorySnapshot {
    flowSteps?: FlowStepDetail[];
    events?: MonitorEvent[];
    agent?: MonitorAgent;
}

export interface Monitor {
    id: string;
    projectId: string; // New field
    nameKey: string;
    desc: string;
    status: 'ok' | 'error' | 'slow';
    type: 'api' | 'mq' | 'search' | 'order' | 'db' | 'cache';
    metrics: MonitorMetric[];
    history: ('ok' | 'error' | 'slow')[];
    events?: MonitorEvent[];
    agent?: MonitorAgent;
    flowSteps?: FlowStepDetail[];
    historySnapshots?: HistorySnapshot[];
}

export const initialInfrastructure: Monitor[] = [
    {
        id: 'api-gateway',
        projectId: '1',
        nameKey: 'monitor.apiGateway',
        desc: 'https://api.example.com',
        status: 'ok',
        type: 'api',
        metrics: [
            { labelKey: 'metric.uptime', value: '99.9%', status: 'good' },
            { labelKey: 'metric.latency', value: '45ms' }
        ],
        history: ['ok', 'ok', 'ok', 'ok', 'ok', 'error', 'ok', 'ok', 'ok', 'ok'],
        events: [
            { time: 'Just now', msg: 'Healthy check passed' }
        ]
    },
    {
        id: 'rabbitmq',
        projectId: '1',
        nameKey: 'monitor.rabbitmq',
        desc: '192.168.1.102:5672',
        status: 'error',
        type: 'mq',
        metrics: [
            { labelKey: 'metric.uptime', value: '20%', status: 'bad' },
            { labelKey: 'metric.latency', value: 'value.timeout', status: 'bad' }
        ],
        history: ['ok', 'ok', 'error', 'error', 'error', 'error', 'error', 'error', 'error', 'error'],
        events: [
            { time: 'Just now', msg: 'Connection refused' },
            { time: '30s ago', msg: 'Connection refused' }
        ],
        agent: {
            steps: [
                { title: 'Analyzing Connectivity', desc: 'TCP refused. Checking Kubernetes status...' }
            ],
            rootCause: {
                title: 'Root Cause',
                desc: 'Process killed by OOM (Out of Memory). Recent usage spiked to 8GB.',
                confidence: '95% Confidence'
            }
        }
    },
    {
        id: 'elasticsearch',
        projectId: '1',
        nameKey: 'ElasticSearch',
        desc: '192.168.1.103:9200',
        status: 'slow',
        type: 'search',
        metrics: [
            { labelKey: 'metric.uptime', value: '100%', status: 'good' },
            { labelKey: 'metric.latency', value: '850ms', status: 'bad' }
        ],
        history: ['ok', 'ok', 'slow', 'ok', 'slow', 'slow', 'ok', 'ok', 'slow', 'ok'],
        events: [
            { time: 'Just now', msg: 'Latency high (850ms)' }
        ],
        agent: {
            rootCause: {
                title: 'Observation',
                desc: 'Large shard relocation in progress on node es-01.'
            }
        }
    }
];

export const initialBusiness: Monitor[] = [
    {
        id: 'order-flow',
        projectId: '1',
        nameKey: 'monitor.orderFlow',
        desc: 'Create → Stock → Pay → Callback',
        status: 'error',
        type: 'order',
        metrics: [
            { labelKey: 'metric.successRate', value: '87%', status: 'bad' },
            { labelKey: 'metric.avgDuration', value: '1.8s' }
        ],
        history: ['ok', 'ok', 'ok', 'error', 'ok', 'error', 'ok', 'ok', 'ok', 'error'],
        historySnapshots: [
            // index 0 - ok
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '95ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:01:00', retries: 0, throughput: '310 req/min', p99: '180ms' },
                    { name: 'Stock', status: 'ok', duration: '380ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:01:00', retries: 0, throughput: '290 req/min', p99: '620ms' },
                    { name: 'Pay', status: 'ok', duration: '0.9s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:01:01', retries: 0, throughput: '210 req/min', p99: '1.8s' },
                    { name: 'Callback', status: 'ok', duration: '1.2s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:01:02', retries: 0, throughput: '150 req/min', p99: '3.5s' }
                ],
                events: [
                    { time: '14:01', id: 'ORD-980', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] },
                    { time: '14:00', id: 'ORD-979', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] }
                ]
            },
            // index 1 - ok
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '110ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:04:10', retries: 0, throughput: '315 req/min', p99: '200ms' },
                    { name: 'Stock', status: 'ok', duration: '420ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:04:10', retries: 0, throughput: '275 req/min', p99: '650ms' },
                    { name: 'Pay', status: 'ok', duration: '1.0s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:04:11', retries: 0, throughput: '205 req/min', p99: '1.9s' },
                    { name: 'Callback', status: 'ok', duration: '1.5s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:04:12', retries: 0, throughput: '140 req/min', p99: '3.8s' }
                ],
                events: [
                    { time: '14:04', id: 'ORD-983', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] },
                    { time: '14:03', id: 'ORD-982', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] }
                ]
            },
            // index 2 - ok
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '100ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:07:20', retries: 0, throughput: '320 req/min', p99: '190ms' },
                    { name: 'Stock', status: 'ok', duration: '400ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:07:20', retries: 0, throughput: '280 req/min', p99: '640ms' },
                    { name: 'Pay', status: 'ok', duration: '1.1s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:07:21', retries: 0, throughput: '200 req/min', p99: '2.0s' },
                    { name: 'Callback', status: 'ok', duration: '1.3s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:07:23', retries: 0, throughput: '145 req/min', p99: '3.6s' }
                ],
                events: [
                    { time: '14:07', id: 'ORD-985', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] }
                ]
            },
            // index 3 - error
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '130ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:10:30', retries: 0, throughput: '300 req/min', p99: '220ms' },
                    { name: 'Stock', status: 'ok', duration: '480ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:10:30', retries: 0, throughput: '260 req/min', p99: '700ms' },
                    { name: 'Pay', status: 'ok', duration: '1.3s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:10:31', retries: 1, throughput: '190 req/min', p99: '2.2s' },
                    { name: 'Callback', status: 'error', duration: '12s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:10:33', retries: 3, throughput: '110 req/min', p99: '16s', errorMessage: 'Connection timeout after 12s' }
                ],
                events: [
                    { time: '14:11', id: 'ORD-988', msg: 'Payment callback timeout', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'error' }] },
                    { time: '14:10', id: 'ORD-987', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] }
                ],
                agent: { rootCause: { title: 'Root Cause', desc: 'Payment provider gateway returned 504 after 12s.', confidence: '90% Confidence' } }
            },
            // index 4 - ok
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '105ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:13:40', retries: 0, throughput: '325 req/min', p99: '195ms' },
                    { name: 'Stock', status: 'ok', duration: '410ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:13:40', retries: 0, throughput: '285 req/min', p99: '660ms' },
                    { name: 'Pay', status: 'ok', duration: '1.0s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:13:41', retries: 0, throughput: '205 req/min', p99: '1.9s' },
                    { name: 'Callback', status: 'ok', duration: '2.0s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:13:42', retries: 0, throughput: '130 req/min', p99: '4.2s' }
                ],
                events: [
                    { time: '14:14', id: 'ORD-990', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] }
                ]
            },
            // index 5 - error
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '125ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:16:50', retries: 0, throughput: '305 req/min', p99: '215ms' },
                    { name: 'Stock', status: 'ok', duration: '460ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:16:50', retries: 0, throughput: '265 req/min', p99: '690ms' },
                    { name: 'Pay', status: 'ok', duration: '1.4s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:16:51', retries: 2, throughput: '185 req/min', p99: '2.4s' },
                    { name: 'Callback', status: 'error', duration: '18s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:16:53', retries: 3, throughput: '100 req/min', p99: '20s', errorMessage: 'Connection refused by remote host' }
                ],
                events: [
                    { time: '14:17', id: 'ORD-992', msg: 'Payment callback refused', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'error' }] },
                    { time: '14:16', id: 'ORD-991', msg: 'Payment callback refused', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'error' }] }
                ],
                agent: { rootCause: { title: 'Root Cause', desc: 'Remote host payment-provider.com actively refusing connections. Possible provider-side outage.', confidence: '92% Confidence' } }
            },
            // index 6 - ok
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '98ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:19:00', retries: 0, throughput: '330 req/min', p99: '185ms' },
                    { name: 'Stock', status: 'ok', duration: '390ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:19:00', retries: 0, throughput: '290 req/min', p99: '630ms' },
                    { name: 'Pay', status: 'ok', duration: '0.8s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:19:01', retries: 0, throughput: '215 req/min', p99: '1.7s' },
                    { name: 'Callback', status: 'ok', duration: '1.1s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:19:02', retries: 0, throughput: '155 req/min', p99: '3.2s' }
                ],
                events: [
                    { time: '14:19', id: 'ORD-993', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] }
                ]
            },
            // index 7 - ok
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '102ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:20:10', retries: 0, throughput: '318 req/min', p99: '192ms' },
                    { name: 'Stock', status: 'ok', duration: '430ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:20:10', retries: 0, throughput: '278 req/min', p99: '660ms' },
                    { name: 'Pay', status: 'ok', duration: '1.1s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:20:11', retries: 0, throughput: '202 req/min', p99: '2.0s' },
                    { name: 'Callback', status: 'ok', duration: '1.4s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:20:13', retries: 0, throughput: '142 req/min', p99: '3.7s' }
                ],
                events: [
                    { time: '14:20', id: 'ORD-994', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] }
                ]
            },
            // index 8 - ok
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '108ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:21:20', retries: 0, throughput: '322 req/min', p99: '198ms' },
                    { name: 'Stock', status: 'ok', duration: '440ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:21:20', retries: 0, throughput: '282 req/min', p99: '670ms' },
                    { name: 'Pay', status: 'ok', duration: '1.0s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:21:21', retries: 0, throughput: '208 req/min', p99: '1.9s' },
                    { name: 'Callback', status: 'ok', duration: '1.6s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:21:22', retries: 0, throughput: '138 req/min', p99: '3.9s' }
                ],
                events: [
                    { time: '14:21', id: 'ORD-998', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] }
                ]
            },
            // index 9 - error (current)
            {
                flowSteps: [
                    { name: 'Create', status: 'ok', duration: '120ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:22:58', retries: 0, throughput: '320 req/min', p99: '210ms' },
                    { name: 'Stock', status: 'ok', duration: '450ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:22:58', retries: 0, throughput: '280 req/min', p99: '680ms' },
                    { name: 'Pay', status: 'ok', duration: '1.2s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:22:59', retries: 1, throughput: '200 req/min', p99: '2.1s' },
                    { name: 'Callback', status: 'error', duration: '15s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:23:01', retries: 3, throughput: '120 req/min', p99: '18s', errorMessage: 'Connection timeout after 15s' }
                ],
                events: [
                    { time: '14:23', id: 'ORD-999', msg: 'Payment callback timeout', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'error' }] },
                    { time: '14:22', id: 'ORD-998', msg: 'Order completed', flow: [{ name: 'Create', status: 'ok' }, { name: 'Stock', status: 'ok' }, { name: 'Pay', status: 'ok' }, { name: 'Callback', status: 'ok' }] }
                ],
                agent: { rootCause: { title: 'Root Cause', desc: 'External Payment Provider latency (12.5s).', confidence: '88% Confidence' } }
            }
        ],
        flowSteps: [
            { name: 'Create', status: 'ok', duration: '120ms', endpoint: 'order-service/api/v1/orders', threshold: '500ms', startedAt: '14:22:58', retries: 0, throughput: '320 req/min', p99: '210ms' },
            { name: 'Stock', status: 'ok', duration: '450ms', endpoint: 'inventory-service/api/v1/reserve', threshold: '1s', startedAt: '14:22:58', retries: 0, throughput: '280 req/min', p99: '680ms' },
            { name: 'Pay', status: 'ok', duration: '1.2s', endpoint: 'payment-service/api/v1/charge', threshold: '3s', startedAt: '14:22:59', retries: 1, throughput: '200 req/min', p99: '2.1s' },
            { name: 'Callback', status: 'error', duration: '15s', endpoint: 'payment-provider.com/callback', threshold: '5s', startedAt: '14:23:01', retries: 3, throughput: '120 req/min', p99: '18s', errorMessage: 'Connection timeout after 15s' }
        ],
        events: [
            {
                time: '14:23',
                id: 'ORD-999',
                msg: 'Payment callback timeout',
                flow: [
                    { name: 'Create', status: 'ok' },
                    { name: 'Stock', status: 'ok' },
                    { name: 'Pay', status: 'ok' },
                    { name: 'Callback', status: 'error' }
                ]
            },
            {
                time: '14:21',
                id: 'ORD-998',
                msg: 'Order completed',
                flow: [
                    { name: 'Create', status: 'ok' },
                    { name: 'Stock', status: 'ok' },
                    { name: 'Pay', status: 'ok' },
                    { name: 'Callback', status: 'ok' }
                ]
            },
            {
                time: '14:19',
                id: 'ORD-997',
                msg: 'Payment callback timeout',
                flow: [
                    { name: 'Create', status: 'ok' },
                    { name: 'Stock', status: 'ok' },
                    { name: 'Pay', status: 'ok' },
                    { name: 'Callback', status: 'error' }
                ]
            },
            {
                time: '14:15',
                id: 'ORD-996',
                msg: 'Order completed',
                flow: [
                    { name: 'Create', status: 'ok' },
                    { name: 'Stock', status: 'ok' },
                    { name: 'Pay', status: 'ok' },
                    { name: 'Callback', status: 'ok' }
                ]
            },
            {
                time: '14:12',
                id: 'ORD-995',
                msg: 'Payment callback timeout',
                flow: [
                    { name: 'Create', status: 'ok' },
                    { name: 'Stock', status: 'ok' },
                    { name: 'Pay', status: 'ok' },
                    { name: 'Callback', status: 'error' }
                ]
            }
        ],
        agent: {
            rootCause: {
                title: 'Root Cause',
                desc: 'External Payment Provider latency (12.5s).'
            }
        }
    }
];
