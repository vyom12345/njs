var url = require('url');
var mysql = require('mysql');
var http = require('http');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin123", // Update this if you have a password set for your MariaDB root user
    database: "taskdb"
});

http.createServer(function (req, res) {
    var u = url.parse(req.url, true);
    if (u.pathname === '/app.js' && req.method === 'GET') {
        var taskName = u.query.taskName;
        var taskDescription = u.query.taskDescription;
        var dueDate = u.query.dueDate;
        var status = u.query.status;
        var priority = u.query.priority;
        var assignee = u.query.assignee;
        var startDate = u.query.startDate;
        var endDate = u.query.endDate;
        var action = u.query.action;

        if (action === 'Display') {
            var q = "SELECT * FROM tasks";
            con.query(q, function (err, result) {
                if (err) {
                    console.error(err);
                    res.write("Error while retrieving data.");
                    res.end();
                } else {
                    var dataStr = `
                    <html>
                    <head>
                    <style>
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px auto;
                            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
                            background: white;
                        }

                        th, td {
                            border: 1px solid #e6e6e6;
                            text-align: left;
                            padding: 12px;
                        }

                        th {
                            background-color: #f2f2f2;
                            color: #000;
                        }

                        tr:nth-child(even) {
                            background-color: #f2f2f2;
                            color: #000;
                        }

                        tr:nth-child(odd) {
                            background-color: #e6e6e6;
                            color: #000;
                        }

                        tr:hover {
                            background-color: #ddd;
                        }

                        th, td {
                            transition: 0.3s;
                        }

                        th:hover {
                            background-color: #ddd;
                        }
                    </style>

                    </head>
                    <body>
                    <h2>Data retrieved:</h2>
                    <table>
                        <tr>
                            <th>Task Name</th>
                            <th>Task Description</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Priority</th> 
                            <th>Assignee</th> 
                            <th>Start Date</th> 
                            <th>End Date</th> 
                        </tr>
                    `;

                    for (var i = 0; i < result.length; i++) {
                        var dueDate = new Date(result[i].due_date).toISOString().split('T')[0];
                        var startDate = result[i].start_date ? new Date(result[i].start_date).toISOString().split('T')[0] : '';
                        var endDate = result[i].end_date ? new Date(result[i].end_date).toISOString().split('T')[0] : '';
                    
                        dataStr += `
                        <tr>
                            <td>${result[i].task_name}</td>
                            <td>${result[i].task_description}</td>
                            <td>${dueDate}</td>
                            <td>${result[i].status}</td>
                            <td>${result[i].priority}</td> 
                            <td>${result[i].assignee}</td> 
                            <td>${startDate}</td> 
                            <td>${endDate}</td> 
                        </tr>
                        `;
                    }

                    dataStr += `</table>
                                </body>
                                </html>`;
                    res.write(dataStr);
                    res.end();
                }
            });
        } else if (action === 'Update') {
            var updateTask = u.query.updateTask;
            var q = "UPDATE tasks SET task_description = ?, due_date = ?, status = ?, priority = ?, assignee = ?, start_date = ?, end_date = ? WHERE task_name = ?";
            con.query(q, [taskDescription, dueDate, status, priority, assignee, startDate, endDate, updateTask], function (err) {
                if (err) {
                    console.error(err);
                    res.write("Error while updating data.");
                } else {
                    res.write("Data updated successfully.");
                }
                res.end();
            });
        } else if (action === 'Delete') {
            var deleteTask = u.query.deleteTask;
            var q = "DELETE FROM tasks WHERE task_name = ?";
            con.query(q, [deleteTask], function (err) {
                if (err) {
                    console.error(err);
                    res.write("Error while deleting data.");
                } else {
                    res.write("Data deleted successfully.");
                }
                res.end();
            });
        } else {
            var q = "INSERT INTO tasks (task_name, task_description, due_date, status, priority, assignee, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            con.query(q, [taskName, taskDescription, dueDate, status, priority, assignee, startDate, endDate], function (err) {
                if (err) {
                    console.error(err);
                    res.write("Error while adding data.");
                } else {
                    res.write("Data added successfully.");
                }
                res.end();
            });
        }
    } else {
        res.write(`
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Poppins', sans-serif;
                    background: linear-gradient(to right, #ff6347, #ff69b4);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
        
                .container {
                    background: rgba(255, 255, 255, 0.9);
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
                    max-width: 600px;
                    width: 100%;
                    text-align: left;
                    margin: 10px;
                }
        
                h2 {
                    color: #000;
                    font-size: 24px;
                    margin: 10px 0;
                }
        
                label {
                    font-weight: bold;
                    display: block;
                    margin-bottom: 5px;
                    color: #000;
                }
        
                input[type="text"],
                input[type="date"],
                select {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 16px;
                    font-family: 'Poppins', sans-serif;
                    height: 45px;
                }
        
                select {
                    height: 45px;
                }
        
                .form-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
        
                .form-row div {
                    flex: 1;
                }
        
                .button-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                }
        
                .gradient-button {
                    padding: 10px;
                    border: none;
                    border-radius: 15px;
                    cursor: pointer;
                    flex: 1;
                    margin-right: 10px;
                    color: #fff;
                }
        
                /* Apply different background gradients to the buttons */
                #submit-button1 {
                    background: linear-gradient(135deg, #5DE7A5, #57B8FF);
                }
        
                #submit-button2 {
                    background: linear-gradient(135deg, #57B8FF, #A257FF);
                }
        
                #submit-button3 {
                    background: linear-gradient(135deg, #FF6B6B, #FFD166);
                }
        
                #submit-button4 {
                    background: linear-gradient(135deg, #AAAAAA, #BBBBBB);
                }
            </style>
        </head>
        <body>
        <div class="container">
            <h2>Task Management</h2>
            <form action="/app.js" method="GET">
                <div>
                    <label for="updateTask">Task Name to Update:</label>
                    <input type="text" id="updateTask" name="updateTask">
                </div>
        
                <div>
                    <label for="deleteTask">Task Name to Delete:</label>
                    <input type="text" id="deleteTask" name="deleteTask">
                </div>
        
                <div class="form-row">
                    <div>
                        <label for="taskName">Task Name:</label>
                        <input type="text" id="taskName" name="taskName">
                    </div>
                    <div>
                        <label for="taskDescription">Task Description:</label>
                        <input type="text" id="taskDescription" name="taskDescription">
                    </div>
                </div>
                <div class="form-row">
                    <div>
                        <label for="dueDate">Due Date:</label>
                        <input type="date" id="dueDate" name="dueDate">
                    </div>
                    <div>
                        <label for="status">Status:</label>
                        <select id="status" name="status">
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div>
                        <label for="priority">Priority:</label>
                        <select id="priority" name="priority">
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label for="assignee">Assignee:</label>
                        <input type="text" id="assignee" name="assignee">
                    </div>
                </div>
                <div class="form-row">
                    <div>
                        <label for="startDate">Start Date:</label>
                        <input type="date" id="startDate" name="startDate">
                    </div>
                    <div>
                        <label for="endDate">End Date:</label>
                        <input type="date" id="endDate" name="endDate">
                    </div>
                </div>
                <div class="button-container">
                    <input type="submit" id="submit-button1" class="gradient-button" name="action" value="Insert">
                    <input type="submit" id="submit-button2" class="gradient-button" name="action" value="Update">
                    <input type="submit" id="submit-button3" class="gradient-button" name="action" value="Delete">
                    <input type="submit" id="submit-button4" class="gradient-button" name="action" value="Display">
                </div>
            </form>
        </div>
        </body>
        </html>
        `);
        res.end();
    }
}).listen(5500);
