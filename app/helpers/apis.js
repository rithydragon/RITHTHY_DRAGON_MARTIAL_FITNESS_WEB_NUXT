const api = {
    learner_enrollment: {
        enrollment: {
            list: '/api/learner/list'
        }
    },

    course:{
        list:'/api/course/list'
    },
    course: {
        list: '/api/courses/list',
        create: '/api/courses/create',
        getById: (id) => `/api/courses/${id}`, // Dynamic endpoint
        update: '/api/courses/update',
        delete: '/api/courses/delete',
      },
};

export default api;
