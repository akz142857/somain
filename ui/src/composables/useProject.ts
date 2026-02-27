import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMockService } from '../services/mockService';

const activeProjectId = ref('1');
const activeProjectCode = ref('ecommerce');

export const useProject = () => {
    return {
        activeProjectId,
        activeProjectCode
    };
};

/** Call once in App.vue to keep activeProjectId in sync with route projectCode */
export const useSyncProjectRoute = () => {
    const route = useRoute();
    const router = useRouter();
    const { getProjectByCode, getProjects } = useMockService();

    watch(
        () => route.params.projectCode as string | undefined,
        async (code) => {
            if (code) {
                const project = getProjectByCode(code);
                if (project) {
                    activeProjectCode.value = code;
                    activeProjectId.value = project.id;
                } else {
                    // Unknown code — redirect to first project
                    const projects = (await getProjects()).value;
                    if (projects.length > 0) {
                        const fallback = projects[0];
                        router.replace({ name: route.name as string, params: { ...route.params, projectCode: fallback.code } });
                    }
                }
            }
        },
        { immediate: true }
    );
};
