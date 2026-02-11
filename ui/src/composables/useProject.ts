import { ref } from 'vue';

const activeProjectId = ref('1');

export const useProject = () => {
    return {
        activeProjectId
    };
};
