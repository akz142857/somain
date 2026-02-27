export type MetricsLayout = 'inline' | 'grid' | 'hero';
export type SparklineVariant = 'bar' | 'toggle-timeline';
export type CardWidget = 'switch-indicator' | 'progress-bar';

export interface CardLayoutConfig {
  metricsLayout: MetricsLayout;
  heroMetricIndex?: number;
  sparklineVariant: SparklineVariant;
  widgets?: CardWidget[];
  progressMetricIndices?: [number, number]; // [current, desired]
  detailTabs?: string[];
  showDetailLink?: boolean;
}

const DEFAULT_TABS = ['events', 'agent', 'config'];

const defaultLayout: CardLayoutConfig = {
  metricsLayout: 'inline',
  sparklineVariant: 'bar',
  detailTabs: DEFAULT_TABS,
  showDetailLink: true,
};

const layoutMap: Record<string, Partial<CardLayoutConfig>> = {
  ecs: {
    widgets: ['progress-bar'],
    progressMetricIndices: [0, 1],
  },
  crawler: {
    metricsLayout: 'grid',
  },
  switch: {
    sparklineVariant: 'toggle-timeline',
    detailTabs: ['events', 'config'],
    showDetailLink: false,
  },
  chatbot: {
    metricsLayout: 'grid',
  },
  order: {
    detailTabs: ['events', 'agent', 'config', 'flow'],
  },
};

export function resolveLayout(type: string): CardLayoutConfig {
  const override = layoutMap[type];
  if (!override) return { ...defaultLayout };
  return { ...defaultLayout, ...override };
}
