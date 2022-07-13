const dbaccess = require("../database/dbaccess");
class DoctorDashboardService {
  constructor() {}

  async loginDoctor(userInfo, result) {
    const connection = dbaccess.openConnection();
    try {
      //select * from table_name where where email=? and password=?
      connection.query(
        "select * from table_name where where email=? and password=?",
        [userInfo.email, userInfo.password],
        function (err, res) {
          if (err) {
            result(err, null);
          } else {
            result(null, res);
          }
        }
      );
    } catch (error) {
      console.log("Method:LoginUser,File:appservice.js--> " + error);
    } finally {
      dbaccess.closeConnection(connection);
    }
  }

  async getPatientConsultationData(userInfo, result) {
    const connection = dbaccess.openConnection();
    try {
      //select * from table_name where where email=? and password=?
      connection.query(
        "SELECT * FROM pres_master_prescription LEFT JOIN pres_data ON pres_master_prescription.diagnosis_id = pres_data.end_result_id WHERE pres_master_prescription.diagnosis_id = ?",
        [userInfo.diagnosis_id],
        function (err, res) {
          if (err) {
            result(err, null);
          } else {
            result(null, res);
          }
        }
      );
    } catch (error) {
      console.log("Method:LoginUser,File:appservice.js--> " + error);
    } finally {
      dbaccess.closeConnection(connection);
    }
  }

  async updatePatientConsultationData(updateData, result) {
    const connection = dbaccess.openConnection();
    try {
      //select * from table_name where where email=? and password=?
      connection.query(
        " UPDATE pres_master_prescription SET pres_master_prescription.diagnosis = CASE WHEN ?='' THEN pres_master_prescription.diagnosis ELSE ? END, pres_master_prescription.medicine_prescribed = CASE WHEN ?='' THEN pres_master_prescription.medicine_prescribed ELSE ? END WHERE pres_master_prescription.diagnosis_id = ?",
        [
          updateData.diagnosis,
          updateData.diagnosis,
          updateData.medicine_prescribed,
          updateData.medicine_prescribed,
          updateData.diagnosis_id,
        ],
        function (err, res) {
          if (err) {
            result(err, null);
          } else {
            result(null, res);
          }
        }
      );
    } catch (error) {
      console.log("Method:LoginUser,File:appservice.js--> " + error);
    } finally {
      dbaccess.closeConnection(connection);
    }
  }
}
module.exports = DoctorDashboardService;
