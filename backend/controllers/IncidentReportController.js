// const prisma = require ('../prisma/prisma-client');
//
// const ReportController = {
//     createReport: async (req, res) => {
//         const {fullName, organization, eventDateTime, location, description,  reportDateTime, recurrenceProbability, consequences, captchaCode, fileUrl} = req.body;
//
//         if(!fullName||!organization||!eventDateTime||!location|| !description||!reportDateTime||!recurrenceProbability  ||!consequences||!captchaCode ){
//             return res.status(400).json({error: "Пожалуйста, заполните обязательные поля"});
//         }
//
//         try{
//
//         }catch(err){
//             console.error('create report error', error);
//             return res.status(502).json({error:"Internal server error"});
//
//         }
//     },
//     deleteReport: async (req, res) => {
//
//     },
//     getReports: async (req, res) => {
//
//     },
//     getReportById: async (req, res) => {
//
//     }
// }