const dbaccess= require("../database/dbaccess");
class DoctorDashboardService{

    constructor()
    {}

    async loginDoctor(userInfo, result) {
        const connection = dbaccess.openConnection();
        try {
            //select * from table_name where where email=? and password=?
            connection.query("select * from table_name where where email=? and password=?", [userInfo.email, userInfo.password], function (err, res) {
                if (err) {
                    result(err, null);
                }
                else {
                    result(null, res);
                }
            
            });
        }
        catch (error) {
            console.log("Method:LoginUser,File:appservice.js--> " + error);
        }
        finally {
            dbaccess.closeConnection(connection);
        }
    }

    async getPatientConsultationData(userInfo, result) {
        const connection = dbaccess.openConnection();
        try {
            //select * from table_name where where email=? and password=?
            connection.query("SELECT * FROM employee LEFT JOIN employeedata ON employee.empid = employeedata.empid LEFT JOIN booksdata ON employee.empid = booksdata.empid where employee.empid=?", [userInfo.empid], function (err, res) {
                if (err) {
                    result(err, null);
                }
                else {
                    result(null, res);
                }
            
            });
        }
        catch (error) {
            console.log("Method:LoginUser,File:appservice.js--> " + error);
        }
        finally {
            dbaccess.closeConnection(connection);
        }
    }
   


}
module.exports=DoctorDashboardService;