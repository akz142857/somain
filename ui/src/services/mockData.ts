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
    flowSteps?: { name: string; status: 'ok' | 'error' | 'pending'; duration?: string }[];
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
        flowSteps: [
            { name: 'Create', status: 'ok', duration: '120ms' },
            { name: 'Stock', status: 'ok', duration: '450ms' },
            { name: 'Pay', status: 'ok', duration: '1.2s' },
            { name: 'Callback', status: 'error', duration: '15s' }
        ],
        events: [
            {
                id: 'ORD-999',
                msg: 'Payment callback timeout',
                flow: [
                    { name: 'Create', status: 'ok' },
                    { name: 'Stock', status: 'ok' },
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
