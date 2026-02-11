import { ref, reactive } from 'vue';
import { initialInfrastructure, initialBusiness, initialProjects, type Monitor, type Project } from './mockData';

// State is reactive to be shared if needed, or we can just return refs
// For simplicity in simulation, we'll keep a local state and expose it
const projectsForSim = ref<Project[]>(JSON.parse(JSON.stringify(initialProjects)));
const infrastructureForSim = ref<Monitor[]>(JSON.parse(JSON.stringify(initialInfrastructure)));
const businessForSim = ref<Monitor[]>(JSON.parse(JSON.stringify(initialBusiness)));

let intervalId: number | null = null;

const randomStatus = (): 'ok' | 'error' | 'slow' => {
    const rand = Math.random();
    if (rand > 0.9) return 'error';
    if (rand > 0.8) return 'slow';
    return 'ok';
};

const randomLatency = (base: number) => {
    return Math.floor(base + Math.random() * 50) + 'ms';
};

const simulateUpdates = () => {
    // Infrastructure updates
    infrastructureForSim.value.forEach(m => {
        // Randomly update status occasionally
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

    // Business logic simulation
    businessForSim.value.forEach(m => {
        if (Math.random() > 0.8) {
            const newStatus = randomStatus();
            m.status = newStatus;
            m.history.shift();
            m.history.push(newStatus);
        }
    });
};

export const useMockService = () => {
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

    const addProject = async (name: string, desc: string) => {
        await new Promise(r => setTimeout(r, 300));
        projectsForSim.value.push({
            id: Date.now().toString(),
            nameKey: '',
            rawName: name,
            desc: desc,
            status: 'ok'
        });
    };

    const addMonitor = async (monitor: Partial<Monitor>, group: 'infrastructure' | 'business', projectId: string) => {
        await new Promise(r => setTimeout(r, 300));
        const newMonitor: Monitor = {
            id: Date.now().toString(),
            projectId,
            nameKey: '',
            // @ts-ignore
            desc: monitor.desc || 'No description',
            // @ts-ignore
            status: 'ok',
            // @ts-ignore
            type: monitor.type || 'api',
            metrics: [
                { labelKey: 'metric.uptime', value: '100%', status: 'good' },
                { labelKey: 'metric.latency', value: '20ms' }
            ],
            history: ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'ok'],
            ...monitor
        } as Monitor;

        if (group === 'infrastructure') {
            infrastructureForSim.value.push(newMonitor);
        } else {
            businessForSim.value.push(newMonitor);
        }
    };

    return {
        getInfrastructure,
        getBusiness,
        getProjects,
        addProject,
        addMonitor,
        startSimulation,
        stopSimulation
    };
};
