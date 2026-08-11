export default {
    userCatch: "oc_user_catch",
    deviceId: "oc_device_id",
    dbCode: "oc_database",
    langCode: "i18n_redirected",
    fbMessagingToken: "fb_messaging_token",
  
    humanResource: {
      employee: {
        workingStatus: [
          { text: "Working", value: "Working" },
          { text: "Resigned", value: "Resigned" },
          { text: "Terminated", value: "Terminated" },
          { text: "Expired", value: "Expired" },
          { text: "Abandoned", value: "Abandoned" },
        ],
        maritalStatus: [
          { text: "Married", value: "Married" },
          { text: "Divorce", value: "Divorce" },
          { text: "Widow", value: "Widow" },
          { text: "Single", value: "Single" },
        ],
        NSSFType: [
          { text: "InSystem", value: "InSystem" },
          { text: "OutSystem", value: "OutSystem" },
        ],
  
        strGeneral: "general",
        strWorkInformation: "working_info",
      },
    },
    academic:{
      learningSubject:{
        type: {learningAndExam: 'Learning & Exam', learning:'Learning',exam:'Exam',attendence:'Attendence'}
      },
      schedule:{
        monthList : [
            { Value: 1,Name: 'មករា', NameEn: 'January'},
            { Value: 2,Name: 'កុម្ភ:', NameEn: 'February'},
            { Value: 3,Name: 'មីនា', NameEn: 'March' },
            { Value: 4,Name: 'មេសា', NameEn: 'April' },
            { Value: 5,Name: 'ឧសភា', NameEn: 'May' },
            { Value: 6,Name: 'មិថុនា', NameEn: 'June' },
            { Value: 7,Name: 'កក្កដា', NameEn: 'July'},
            { Value: 8,Name: 'សីហា', NameEn: 'August'},
            { Value: 9,Name: 'កញ្ញា', NameEn: 'September' },
            { Value: 10,Name: 'តុលា', NameEn: 'October'},
            { Value: 11,Name: 'វិច្ឆកា', NameEn: 'November'},
            { Value: 12,Name: 'ធ្នូ', NameEn: 'December'}
        ],
        weekList: [
            { Name: 'សប្តាហ៍ទី​ ១', NameEn: 'Week 1', Value: 1 },
            { Name: 'សប្តាហ៍ទី​ ២', NameEn: 'Week 2', Value: 2 },
            { Name: 'សប្តាហ៍ទី​ ៣', NameEn: 'Week 3', Value: 3 },
            { Name: 'សប្តាហ៍ទី​ ៤', NameEn: 'Week 4', Value: 4 },
            { Name: 'សប្តាហ៍ទី​ ៥', NameEn: 'Week 5', Value: 5 },
            { Name: 'សប្តាហ៍ទី​ ៦', NameEn: 'Week 6', Value: 6 },
        ],
        dayOfWeek:[{Name: 'ថ្ងៃច័ន្ទ',EnglishName:'Monday'},{Name: 'ថ្ងៃអង្គារ',EnglishName:'Tuesday'},{Name: 'ថ្ងៃពុធ',EnglishName:'Wednesday'},{Name: 'ថ្ងៃព្រហស្បតិ៍',EnglishName:'Thursday'},{Name: 'ថ្ងៃសុក្រ',EnglishName:'Friday'},{Name: 'ថ្ងៃសៅរ៍',EnglishName:'Satuarday'},{Name: 'ថ្ងៃអាទិត្យ',EnglishName:'Sunday'}],
        periodType:{
          year: 'Year',
          month:'Month',
          week:'Week'
        },
      }
    },
    color:{
      dayOfWeek:{
        background: [
          "rgba(255, 171, 24, 0.03)",
          "rgba(251, 113, 133, 0.03)",
          "rgba(46, 214, 93, 0.03)",
          "rgba(246, 125, 98, 0.03)",
          "rgba(99, 56, 210, 0.03)",
          "rgba(67, 149, 241, 0.03)",
          "rgba(42, 183, 160, 0.03)"
        ],
        primary: ['#ffab18', '#FB7185', '#2ED65D', '#F67D62', '#6338D2', '#4395F1', '#2AB7A0']
      },
      
    },
  };
  