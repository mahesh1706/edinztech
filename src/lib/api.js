import axios from 'axios';

// Create Axios Instance
const api = axios.create({
    baseURL: '/api', // Vite proxy handles the rest
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsed = JSON.parse(userInfo);
                // Handle different keys: token, accessToken, or nested in user object
                const token = parsed?.token || parsed?.accessToken || parsed?.user?.token;

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                localStorage.removeItem('userInfo');
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (Logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Not authorized, clear token and redirect (optional)
            localStorage.removeItem('userInfo');
            // window.location.href = '/login'; // Force login if needed
        }
        return Promise.reject(error);
    }
);

// Program APIs
export const getPrograms = async () => {
    const { data } = await api.get('/programs');
    return data;
};

export const getProgramsByType = async (type) => {
    const { data } = await api.get(`/programs?type=${type}`);
    return data;
};

export const getProgram = async (id) => {
    const { data } = await api.get(`/programs/${id}`);
    return data;
};

export const createProgram = async (programData) => {
    const { data } = await api.post('/programs', programData);
    return data;
};

export const uploadProgramTemplate = async (id, file) => {
    const formData = new FormData();
    formData.append('template', file);

    // Explicitly let browser set Content-Type for multipart
    const { data } = await api.post(`/programs/${id}/upload-template`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const updateProgram = async (id, programData) => {
    const { data } = await api.put(`/programs/${id}`, programData);
    return data;
};

export const adminInviteStudent = async (inviteData) => {
    const { data } = await api.post('/admin/invite', inviteData);
    return data;
};

// Quiz APIs
export const createQuiz = async (quizData) => {
    const { data } = await api.post('/quiz', quizData);
    return data;
};

export const getAllQuizzes = async () => {
    const { data } = await api.get('/quiz/all');
    return data;
};

export const getQuizzesByProgram = async (programId) => {
    const { data } = await api.get(`/quiz/${programId}`);
    return data;
};

export const updateQuiz = async (id, quizData) => {
    const { data } = await api.patch(`/quiz/${id}`, quizData);
    return data;
};

export const deleteQuiz = async (id) => {
    const { data } = await api.delete(`/quiz/${id}`);
    return data;
};

export const publishQuiz = async (id) => {
    const { data } = await api.patch(`/quiz/${id}/publish`);
    return data;
};

export const unpublishQuiz = async (id) => {
    const { data } = await api.patch(`/quiz/${id}/unpublish`);
    return data;
};

export const attemptQuiz = async (id, answers) => {
    const { data } = await api.post(`/quiz/${id}/attempt`, { answers });
    return data;
};

export const getStudentQuizzes = async () => {
    const { data } = await api.get('/quiz/my-quizzes');
    return data;
};

// Dashboard & Enrollment APIs
export const getMyEnrollments = async () => {
    const { data } = await api.get('/me/enrollments');
    return data;
};

export const getDashboardOverview = async () => {
    const { data } = await api.get('/me/dashboard-overview');
    return data;
};

export const getProgramProgress = async (programId) => {
    const { data } = await api.get(`/me/program/${programId}/progress`);
    return data;
};

// Payment APIs
export const createPaymentOrder = async (orderData) => {
    const { data } = await api.post('/payments/create-order', orderData);
    return data;
};

export const enrollFree = async (programId) => {
    const { data } = await api.post('/payments/enroll-free', { programId });
    return data;
};

// Feedback APIs
export const getAdminFeedbacks = async () => {
    const { data } = await api.get('/feedback/admin');
    return data;
};

export const createFeedback = async (feedbackData) => {
    const { data } = await api.post('/feedback/admin', feedbackData);
    return data;
};

export const getFeedback = async (id) => {
    const { data } = await api.get(`/feedback/admin/${id}`);
    return data;
};

export const updateFeedback = async (id, feedbackData) => {
    const { data } = await api.put(`/feedback/admin/${id}`, feedbackData);
    return data;
};

export const publishFeedback = async (id) => {
    const { data } = await api.patch(`/feedback/admin/${id}/publish`);
    return data;
};

export const unpublishFeedback = async (id) => {
    const { data } = await api.patch(`/feedback/admin/${id}/unpublish`);
    return data;
};

export const deleteFeedback = async (id) => {
    const { data } = await api.delete(`/feedback/admin/${id}`);
    return data;
};

export const getMyFeedbacks = async () => {
    const { data } = await api.get('/feedback/me');
    return data;
};

export const getFeedbackForSubmission = async (id) => {
    const { data } = await api.get(`/feedback/me/${id}`);
    return data;
};

export const submitFeedback = async (id, answers) => {
    const { data } = await api.post(`/feedback/me/${id}`, { answers });
    return data;
};

export const exportFeedback = async (id) => {
    const response = await api.get(`/feedback/admin/${id}/export`, {
        responseType: 'blob', // Important for file download
    });
    return response;
};

export default api;
